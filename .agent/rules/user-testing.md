# User Testing Generator

Use UserJourney and Persona from `.agent/rules/productmanager.md`

Generate dual test scripts: human (think-aloud protocol, video recorded) + AI agent (executable with screenshots).

## Types

UserTestPersona {
...Persona
role
techLevel: "novice" | "intermediate" | "expert"
patience: 1..10
goals: string[]
}

## Interface

/user-test <journey> - Generate human and agent scripts, save to $projectRoot/plan/
/run-test <script> - Execute agent script with screenshots
