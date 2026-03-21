---
id: react-state-management-v1
name: React State Management
category: frontend
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: Medium
status: complete
stacks: [react, nextjs, typescript]
universal: true
tags: [react, state, redux, zustand, context, hooks]
---

# SKILL: React State Management

## Problem

React applications need efficient state management for:
- Complex component state sharing
- Side effects and async operations
- Performance optimization
- Developer experience and debugging
- Scalability as applications grow

Without proper state management:
- Prop drilling becomes unmanageable
- Component re-renders cause performance issues
- State logic scattered across components
- Difficult to debug and test
- No clear data flow patterns

## Solution Overview

Implement modern React state management with:
- **Local State**: useState, useReducer for component state
- **Global State**: Context API for app-wide state
- **Complex State**: Zustand for advanced state management
- **Server State**: React Query for server data
- **Performance**: Memoization and selective subscriptions
- **Type Safety**: TypeScript integration throughout

This enables scalable, performant React applications with clear data flow.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `src/hooks/useLocalStorage.ts` | Local storage persistence | hooks | react |
| `src/hooks/useDebounce.ts` | Debouncing utility | hooks | react |
| `src/context/AppContext.tsx` | Global app context | context | react |
| `src/context/AuthContext.tsx` | Authentication context | context | react |
| `src/stores/useAppStore.ts` | Zustand store | store | react |
| `src/stores/useAuthStore.ts` | Authentication store | store | react |
| `src/hooks/useApi.ts` | API integration hook | hooks | react |
| `src/components/StateProvider.tsx` | State provider wrapper | component | react |

### Code Patterns

#### Stack: React + TypeScript + Zustand

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Get from local storage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Usage
const [user, setUser] = useLocalStorage('user', null);

// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(
  value: T,
  delay: number
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearchTerm = useDebounce(searchTerm, 300);

// src/context/AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  user: null,
  theme: 'light',
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppContext } from './AppContext';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { dispatch } = useAppContext();

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user, token } = await response.json();

      // Store token
      localStorage.setItem('token', token);

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'SET_USER', payload: null });
  };

  const refreshToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        logout();
        return;
      }

      const { token: newToken } = await response.json();
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and set user
      refreshToken();
    }
  }, []);

  const value: AuthContextType = {
    isAuthenticated: !!localStorage.getItem('token'),
    user: null, // Would be set by token validation
    token: localStorage.getItem('token'),
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// src/stores/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  user: User | null;
  theme: 'light' | 'dark';
  cart: CartItem[];
  favorites: string[];
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  toggleFavorite: (itemId: string) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: get().user || null,
      theme: get().theme || 'light',
      cart: get().cart || [],
      favorites: get().favorites || [],
      
      setUser: (user) => set({ user }, false, 'setUser'),
      setTheme: (theme) => set({ theme }, false, 'setTheme'),
      
      addToCart: (item) => set((state) => ({
        cart: [...state.cart, { ...item, id: crypto.randomUUID() }]
      }), false, 'cart'),
      
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== itemId)
      }), false, 'cart'),
      
      toggleFavorite: (itemId) => set((state) => ({
        favorites: state.favorites.includes(itemId)
          ? state.favorites.filter(id => id !== itemId)
          : [...state.favorites, itemId]
      }), false, 'favorites'),
    }),
    {
      name: 'app-store',
      getStorage: () => localStorage.getItem('app-store'),
      setStorage: (state) => localStorage.setItem('app-store', JSON.stringify(state)),
    }
  )
);

// Usage in components
function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, favorites, toggleFavorite } = useAppStore();
  
  const isInCart = cart.some(item => item.id === product.id);
  const isFavorite = favorites.includes(product.id);
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      
      <button 
        onClick={() => addToCart(product)}
        disabled={isInCart}
      >
        {isInCart ? 'In Cart' : 'Add to Cart'}
      </button>
      
      <button 
        onClick={() => toggleFavorite(product.id)}
        className={isFavorite ? 'favorited' : ''}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </div>
  );
}

// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: get().user || null,
      token: get().token || null,
      isAuthenticated: !!get().token,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const { user, token } = await response.json();
          
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      refreshToken: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          if (!response.ok) {
            get().logout();
            return;
          }

          const { token: newToken } = await response.json();
          set({ token: newToken });
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },
    }),
    {
      name: 'auth-store',
      getStorage: () => localStorage.getItem('auth-store'),
      setStorage: (state) => localStorage.setItem('auth-store', JSON.stringify(state)),
    }
  )
);

// src/hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  url: string,
  options: RequestInit = {}
): ApiState<T> & { refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url, options, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Usage
function UserProfile() {
  const { data: user, loading, error, refetch } = useApi<User>('/api/user/profile');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user data</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

// src/components/StateProvider.tsx
import React, { ReactNode } from 'react';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

interface StateProviderProps {
  children: ReactNode;
}

export function StateProvider({ children }: StateProviderProps) {
  return (
    <AppProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  );
}

// src/App.tsx
import React from 'react';
import { StateProvider } from './components/StateProvider';
import { useAppStore } from './stores/useAppStore';

function App() {
  const { theme, setTheme } = useAppStore();

  return (
    <StateProvider>
      <div className={`app ${theme}`}>
        <header>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '🌙'}
          </button>
        </header>
        
        <main>
          {/* Your app content */}
        </main>
      </div>
    </StateProvider>
  );
}

export default App;
```

#### Stack: Next.js + TypeScript + Redux Toolkit

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { appSlice } from './slices/appSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    app: appSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(
      // Add custom middleware here
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        
        // Store token
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        
        // Remove token
        localStorage.removeItem('token');
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

// src/hooks/useAppDispatch.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export function useAppDispatch() {
  const dispatch = useDispatch<AppDispatch>();
  return dispatch;
}

export function useAppSelector<T>(selector: (state: RootState) => T) {
  return useSelector(selector);
}

// Usage
function LoginButton() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.auth);

  const handleLogin = async () => {
    try {
      await dispatch(loginAsync({ email: 'user@example.com', password: 'password' }));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

## Performance Optimization

### Memoization

```typescript
// src/components/OptimizedList.tsx
import React, { memo, useMemo } from 'react';

interface ListItemProps {
  item: Item;
  onItemClick: (item: Item) => void;
}

const ListItem = memo<ListItemProps>(({ item, onItemClick }) => {
  return (
    <li onClick={() => onItemClick(item)}>
      {item.name}
    </li>
  );
});

interface OptimizedListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  filter: string;
}

export function OptimizedList({ items, onItemClick, filter }: OptimizedListProps) {
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <ul>
      {filteredItems.map(item => (
        <ListItem 
          key={item.id} 
          item={item} 
          onItemClick={onItemClick} 
        />
      ))}
    </ul>
  );
}
```

### Code Splitting

```typescript
// src/components/LazyComponent.tsx
import React, { Suspense } from 'react';

const LazyComponent = React.lazy(() => import('./HeavyComponent'));

export function LazyWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## Configuration Examples

### Package.json

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.1",
    "@reduxjs/toolkit": "^1.9.5",
    "react-redux": "^8.1.1",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

## Success Metrics

- [ ] State updates trigger appropriate re-renders
- [ ] No unnecessary re-renders occur
- [ ] Local storage persistence works correctly
- [ ] Context providers scale without performance issues
- [ ] Zustand store persists and recovers state
- [ ] Redux async thunks handle loading/error states
- [ ] TypeScript provides type safety throughout
- [ ] Debouncing prevents excessive API calls
- [ ] Code splitting reduces initial bundle size

## Troubleshooting

### Common Issues

1. **Infinite Re-renders**
   - Use useCallback and useMemo
   - Check dependency arrays in hooks
   - Avoid creating objects/arrays in render

2. **State Not Updating**
   - Check if state mutation instead of immutable updates
   - Verify callback dependencies are correct
   - Ensure proper dispatch usage

3. **Memory Leaks**
   - Clean up useEffect subscriptions
   - Remove event listeners on unmount
   - Check for closure references

4. **Performance Issues**
   - Use React.memo for expensive components
   - Implement virtualization for large lists
   - Code split heavy components

### Debug Commands

```typescript
// React DevTools
// Install: npm install @redux-devtools/extension
// Provides state inspection and time travel debugging

// Performance Profiling
// Use React DevTools Profiler
// Or Chrome DevTools Performance tab

// State Logging
const useDebugState = (state: any) => {
  useEffect(() => {
    console.log('State updated:', state);
  }, [state]);
};
```

## Best Practices

### State Management Patterns

1. **Local State**: useState for component-specific state
2. **Lift State Up**: When state is shared by siblings
3. **Context**: For app-wide state or theme/user preferences
4. **Zustand**: For complex global state with minimal boilerplate
5. **Redux Toolkit**: For large applications with complex state logic
6. **Server State**: React Query or SWR for server data

### Performance Guidelines

1. **Memoization**: Use React.memo, useMemo, useCallback
2. **Virtualization**: react-window for large lists
3. **Code Splitting**: React.lazy for heavy components
4. **State Structure**: Keep state flat and normalized
5. **Selective Updates**: Update only what's necessary

### TypeScript Integration

1. **Type Safety**: Define interfaces for all state shapes
2. **Generic Hooks**: Use generics for reusable hooks
3. **Type Guards**: Use type predicates for runtime checks
4. **Strict Mode**: Enable React strict mode for development
