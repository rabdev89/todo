-- AlterTable
ALTER TABLE `tasks` MODIFY `priority` ENUM('low', 'medium', 'high', 'urgent', 'critical') NOT NULL DEFAULT 'medium',
    MODIFY `status` ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending';
