| Phase | Activity | Action | Commands | Gate |
|------|----------|--------|----------|------|
| Framework Bootstrap | Check Repository Integrity | validate_repository_structure | npm run start -- framework-test |  |
| Framework Bootstrap | Check Framework Version | validate_framework_version | npm run start -- framework-test |  |
| Framework Bootstrap | Run Self Diagnostics | run_framework_diagnostics | npm run start -- framework-test |  |
| Framework Installation | Initialize Framework | install_framework_dependencies | npm install |  |
| Framework Installation | Environment Check | validate_environment | npm run start -- framework-test |  |
| Framework Installation | Framework Test | run_framework_tests | npm run start -- framework-test |  |
| Framework Installation | Generate Health Report | generate_health_report | npm run start -- framework-test |  |
| Framework Installation | Start Framework Services | start_engine_services | npm run start -- framework-start |  |
| Framework Installation | Start Watchdog | start_watchdog_service | npm run start -- framework-start |  |
| Project Initialization | Start Project Initialization | start_project_init | npm run start -- project-init --type new |  |
| Project Initialization | Select Project Type | prompt_project_type | npm run start -- project-init --type new |  |
| Project Initialization | Framework Alignment Check | validate_framework_project_alignment | npm run start -- overview |  |
| Project Initialization | Generate Tech Stack | generate_tech_stack | npm run start -- overview |  |
| Project Initialization | Create Project Context | generate_project_context | npm run start -- overview |  |
| Project Initialization | Create Project Management Structure | generate_project_management_structure | npm run start -- overview |  |
| Product Definition | Generate Vision Document | generate_vision_document | npm run start -- overview |  |
| Product Definition | Review Vision | user_review_vision | /review-design | user |
| Product Definition | Create User Flow | generate_user_flow | /init-project | user |
| Product Definition | Validate User Flow | validate_user_flow | /check-implementation |  |
| Product Definition | Align Requirements | generate_requirements | /review-requirements |  |
| Technical Architecture | Design Architecture | generate_architecture_design | npm run start -- architecture |  |
| Technical Architecture | Validate Tech Stack | validate_tech_stack | npm run start -- overview |  |
| Technical Architecture | Plan Database Schema | generate_database_schema | npm run start -- overview |  |
| Technical Architecture | Define API Contracts | generate_api_contracts | npm run start -- overview |  |
| Project Planning | Generate Epics | generate_epics | /scope-epic |  |
| Project Planning | Review Epics | review_epics | /review-requirements | user |
| Project Planning | Generate Tickets | generate_tickets | /update-planning |  |
| Project Planning | Validate Tickets | validate_tickets | /check-implementation |  |
| Project Planning | Generate Project Timeline | generate_project_timeline | npm run start -- overview |  |
| Development | Select Next Ticket | select_next_ticket | npm run start -- next |  |
| Development | Generate Code | generate_code | npm run start -- context T-001 |  |
| Development | AI Code Review | review_code | /code-review |  |
| Development | Generate Unit Tests | generate_unit_tests | /writing-test |  |
| Development | Execute Unit Tests | run_tests | npm run start -- framework-test |  |
| Epic Hardening | Integration Testing | run_integration_tests | npm run start -- framework-test |  |
| Epic Hardening | Bug Fix Cycle | fix_bugs | /debug |  |
| Epic Hardening | Update Documentation | update_documentation | /capture-knowledge |  |
| Epic Hardening | Validate Epic Completion | validate_epic | /check-implementation |  |
| PI Hardening | System Testing | run_system_tests | npm run start -- framework-test |  |
| PI Hardening | Performance Testing | run_performance_tests | npm run start -- framework-test |  |
| PI Hardening | Security Validation | run_security_audit | npm run start -- framework-test |  |
| PI Hardening | Build Release Candidate | build_release_candidate | npm run start -- framework-test |  |
| UAT | Setup UAT Environment | setup_uat_environment | /uat-phase |  |
| UAT | Execute UAT | run_uat | /uat-phase | user |
| UAT | Collect UAT Feedback | collect_uat_feedback | /uat-phase | user |
| UAT | UAT Bug Fix Cycle | fix_uat_bugs | /debug |  |
| Release Preparation | Generate Release Notes | generate_release_notes | npm run start -- overview |  |
| Release Preparation | Generate Deployment Scripts | generate_deployment_scripts | npm run start -- overview |  |
| Release Preparation | Create Rollback Plan | generate_rollback_plan | npm run start -- overview |  |
| Release Preparation | Generate Deployment Checklist | generate_deployment_checklist | npm run start -- overview |  |
| Deployment | Pre-Launch Validation | validate_pre_launch | npm run start -- framework-test |  |
| Deployment | Production Deployment | deploy_to_production | npm run start -- framework-test |  |
| Deployment | Verify Deployment | verify_deployment | npm run start -- framework-test |  |
| Post-Launch Monitoring | Monitor Performance | monitor_performance | npm run start -- framework-test |  |
| Decision Gate | Select Track A/B | select_workflow_track | npm run start -- decision-gate | user |
| Decision Gate | Validate Track Choice | validate_track_selection | npm run start -- framework-test |  |
| Workflow Principles | Update Repository Memory | update_repository_memory | /remember |  |
| Workflow Principles | Enforce Circuit Breaker | enforce_circuit_breaker | /handoff |  |
| Workflow Principles | Check Parallel Work | check_parallel_work | npm run start -- next |  |
| Workflow Principles | Prevent Requirement Drift | prevent_requirement_drift | /reflect | user |
