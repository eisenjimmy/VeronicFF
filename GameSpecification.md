1. Overview

Title: Aeryndor
Genre: Idle / Auto-battle Mech Builder with Gacha
Style: Realistic military sci-fi, PS1-era low-poly 3D aesthetic
Core Pillars:

Deep robot buildcrafting and tradeoffs

Autonomous real-time 1v1 battles

Gacha-driven parts and frame collection

Behavior programming via unlockable behavior chips

2. Target Platforms & Tech

Platforms:

Mobile web (portrait-only, mobile-first layout)

Desktop browser (layout restricted to mobile-phone-width viewport)

Rendering:

WebGL with three.js for 3D robot viewer and battle scenes

PS1-style low-poly visuals, pre-baked lighting where possible

UI:

Single-column layout

Collapsible panels for detail views

Fixed footer navigation with 5 main tabs

Portrait-only, no zoom, fixed screen

Data & Persistence (MVP):

Client-only, no backend

localStorage as persistence layer

Game state stored as JSON: player profile, inventory, frames, parts, behaviors, missions, analytics

Future backend (non-MVP):

Potentially .NET (C#) + Blazor front-end and SQL database

PvP, leaderboards, multi-device sync to be added later

3. Core Loop & Session Design

Target session length: 3–5 minutes
Loop Style: Light idle / auto-battle with heavy emphasis on build optimization.

Typical Session Flow:

Collect Rewards

Daily login / streak rewards

Completed mission chain rewards

Roll Gacha

Spend $ on gacha banners: Standard Parts / Rare Parts / Frame / Event

Handle pity mechanics and rare rewards

Change Loadout

Edit equipped frame

Swap parts affecting stats, weight, energy, heat, CPU, etc.

Assign or adjust behavior preset

Run Missions

Choose a mission (linear stages)

Real-time 1v1 auto-battle simulation

Outcome yields $, parts, and materia (random)

Sell / Dismantle Parts

Sell for $

Dismantle for materia (random range scaled by rarity)

Experiment

Try new builds or behaviors to break through difficult missions

Optional: test builds in a sandbox mission

PvP, rankings, and leaderboards are planned features, not part of MVP.

4. Economy & Currencies
4.1 Currencies

$ (Dollars)

Earned from missions

Used for:

Gacha pulls

Part upgrades (together with materia)

Materia

Obtained from:

Dismantling parts

Auto-converted duplicates from gacha

Used for:

Part upgrades (cost = $ + materia)

No repair costs, no durability system.

4.2 Gacha System

Banner Types:

Standard Parts Banner

Common → Epic parts

Rare Parts Banner

Rare → Legendary parts, higher base quality

Frame Banner

Frames (base robots) of varying rarities

Event Banner

Time-limited themed parts/frames

Rarity Tiers:

Common

Rare

Epic

Legendary

Pity Mechanics:

Every 10 pulls → guaranteed Epic or higher result on that banner.

Duplicates:

Auto-convert to materia; yield depends on rarity.

(Optionally small $ yield as secondary benefit.)

4.3 Rewards

Missions reward:

$

Parts (random)

Materia (random)

No other reward channels in MVP (no daily quests, achievements yet).

5. Frames, Parts, Stats & Build System
5.1 Frames (“Base Robots”)

Frames have:

Rarity (Common–Legendary)

Base stats and caps:

HP, base armor profiles, base mobility, energy output, heat cap, CPU limit, TAP capacity

Frame characteristics:

E.g. “+8% Melee Damage”, “+12% Cooling Ability”, “+5% Ranged Accuracy”

Slot compatibility rules:

Certain parts restricted to specific frame types / manufacturers

Behavior capacity:

Frames define a cap on Tactic Ability Points (TAP), limiting which behavior trees can be assigned.

5.2 Slots

Each Frame has the following slots:

Head

Torso

Legs

Left Shoulder

Right Shoulder

Left Arm

Right Arm

Inside

Engine

Cooling

Chip

Each part has:

Base stats contribution

Weight

Energy consumption

Heat generation

CPU load

Compatibility tags (by frame type, faction, or structure)

5.3 Primary Stats

HP

Tactics Ability Point (TAP) capacity (frame-level)

Head Armor

Shoulder Armor

Body Armor

Leg Armor

Energy Consumption (from parts, aggregated)

Cooling Ability

Mobility

Energy (Frame output)

Heat Cap

Melee ATK

Ranged ATK

Accuracy

Evasion

5.4 Derived Stats

Examples (for the spec; exact formulas can be tuned later):

DPS Stability

Measures sustained firing capability.

Based on: Cooling Ability vs total Heat Generation.

Effective Hit Chance

Depends on Accuracy vs enemy Evasion.

Damage Mitigation %

Derived from total armor and mobility:

High armor = more flat reduction; mobility influences chance to avoid.

Heat Rejection Rate

Cooling Ability − Heat from all parts/attacks.

If negative, overheat states occur more often.

Stability Rating

Weighted combination of Body and Leg Armor vs total weight.

Affects stagger/knockback resistance.

CPU Load %

Sum of parts’ CPU requirements + behavior complexity vs frame’s CPU capacity.

100% may disable certain behaviors or reduce AI responsiveness.

5.5 Build Constraints (Hard Limits)

A build becomes invalid if any of these conditions fail:

Total Weight > Frame max weight capacity

Total Energy Consumption > Frame Energy Output

Cooling Ability < Minimum threshold relative to total heat output

CPU Load > Frame CPU Limit

Part’s compatibility tags conflict with Frame

Behavior tree’s TAP cost exceeds Frame’s TAP capacity

This enforces deliberate tradeoffs and encourages optimization.

6. Missions & Battle Simulation
6.1 Mission Types (MVP)

All missions are linear stages for now (no branching map). Types:

Elimination: Destroy all enemies

Survival: Survive X seconds

Boss: 1v1 vs a special enemy Frame or Rogue System unit

Even though types exist, MVP implementation can start with Elimination only and treat others as variants.

6.2 Battle Simulation

Style: Real-time 1v1 simulation

Player Control:

No direct control once battle starts

No camera control

No skipping, no “instant resolve”

Determinism:

Battles should be fully deterministic given a seed:

RNG rolls, terrain modifiers, and behavior decisions all derived from a seeded RNG

Useful for replay, debugging, analytics, future PvP verification

Outcome Influencers:

Robot build (stats, parts, frame)

Behavior tree logic

RNG spread (within deterministic seed)

Terrain modifiers (cover, elevation, movement penalties, etc.)

7. Behavior Programming System
7.1 Concept

Player unlocks Behavior Chips over progression (mission rewards, milestones).

Each chip enables a new node type or condition in the behavior tree editor.

Example chips:

“Prioritize ranged weapons if enemy distance > X”

“Close distance if Melee ATK > Ranged ATK”

“Retreat when HP < 25%”

“Focus on highest-HP target”

7.2 Node-Based Behavior Trees

Behavior is a node-based tree/graph:

Condition nodes: check distance, HP, ammo, heat, etc.

Action nodes: move, fire weapon, switch weapon, wait, etc.

Priority/Selector nodes to determine which branch to follow.

Each node has a TAP cost. Total TAP cost ≤ Frame TAP capacity.

7.3 Acquisition & Progression

Start with no behavior or a trivial default “basic AI”.

As the player completes missions, they earn behavior chips:

Unlocks new conditions and actions

Enables more complex behavior trees for advanced frames

7.4 Reusability

Players can save multiple behavior presets.

Presets can be assigned per Frame / loadout.

No sharing or export in MVP.

Presets stored locally in JSON:

Unique ID

Tree definition (nodes, connections)

TAP cost

8. Inventory & Management
8.1 Inventory Design

No inventory size cap.

Display as a table / list with filters and sorts.

Categorization / Filters:

Slot type (Head, Torso, Legs, etc.)

Rarity

Manufacturer / faction

Attributes (e.g. sort by Melee ATK, Ranged ATK, Weight, Energy, etc.)

8.2 Actions

Equip: assign part to a frame slot

Sell: convert to $

Dismantle: gain materia (with variance; higher rarity → higher yield)

9. UI / UX & Navigation
9.1 Main Tabs (Fixed Footer – 5 Tabs)

Home / Hangar

Central 3D robot viewer (three.js)

Shows current Frame and loadout

Tap on parts to open part detail / swap panel

Quick loadouts 1–5

Missions

List of missions / chapters

Mission details (enemy type, recommended stats)

Start battle

Build / Gacha

Gacha banners (standard, rare, frame, event)

Build / assembly view for selecting parts & frames

Rarity / banner information

Inventory

Table of all parts and frames

Filters and sort

Sell / dismantle actions

Menu / More

Garage/Hangar multi-loadout management

Settings

Profile

Friends (placeholder for future social features)

Mailbox (for future rewards delivery, event messages)

9.2 3D Robot Viewer

Implemented with three.js:

Kitbashed robots from primitive meshes (boxes, cylinders, etc.)

Each part corresponds to a geometry group; swapping parts modifies sub-meshes.

Highlight part on hover / tap

Damage overlay via additional material layer or post-process (e.g., blinking red / overlay texture)

Interactions:

Drag to rotate robot

Tap specific part to open detail panel

Loadout selection (1–5 quick presets)

10. 3D & Visual Style

Style: PS1-era, low-poly, slightly chunky geometry with limited textures.

Lighting: Pre-baked or simple directional + ambient light for performance.

Effects:

Damage overlays on hit

Highlight on hover / selection

Simple muzzle flashes, sparks, small explosions

Kitbashing:

Each slot represented as a collection of primitive shapes

Parts control:

Size, length, thickness of limbs

Extra armor plates, boosters, weapon models

Procedural generation controlled by:

Part “visual style” tags

Faction/manufacturer aesthetics

11. Storage & Data (MVP)

All data stored in localStorage as JSON.

Key logical groupings:

Player profile (name, progression, unlocked missions, unlocked behavior chips)

Inventory (parts, frames, quantities, upgrade levels)

Behavior presets (trees + metadata)

Settings (audio, graphics options)

Analytics events backlog (locally queued; optionally sent to remote endpoint later)

12. Analytics & Telemetry (Design-Level)

Even in an offline/local MVP, define analytics points for future integration:

Possible tracked events:

Gacha pulls (banner, rarity outcomes, pity counters)

Mission attempts (mission id, result, duration, build used)

Part upgrades (from level X → Y, cost)

Behavior preset usage (which presets are popular, TAP utilization)

For MVP:

Record these events in-memory or local JSON logs.

Later: send batched analytics to a backend when online.

13. MVP Scope Summary

IN for MVP:

Local-only game, all data in localStorage JSON

1 mission type (Elimination) implemented first

Limited set of:

Frames

Parts

Behavior chips

Real-time 1v1 deterministic battle with seed

Gacha with pity, $ and materia usage

Inventory with sell/dismantle

Three.js robot viewer with:

Kitbashed geometry

Rotation, part highlighting

Basic analytics logging (locally stored)

OUT for MVP (future work):

Online backend (.NET + SQL)

PvP and leaderboards

Friends interactions and mailbox actual server messages

Multiple mission types fully differentiated

Behavior sharing/export

Cross-device sync, account system

Where to Go Next

For the next step, I suggest one of these:

Define JSON data schemas for:

Frames

Parts

Behavior chips & behavior trees

Inventory & missions

three.js design prototype spec:

Scene setup

Robot assembly pipeline (how a Frame + parts → mesh graph)

Damage overlay & highlight implementation

Tell me which area you want to tackle next, and I’ll write it out at implementation-ready detail.

Now put together what you additionally gave me and my inputs and put together a nice game specification markdown file and single prompt that would build this game in markdown file. Be very descriptive with All of the formulas, parts list, lore, missions, frames, generated using armored core parts and anything related to mech. Generate a lot.

Below is a complete, extended, single-file Game Specification for Aeryndor, formatted entirely in Markdown, with:

✔ Full lore
✔ Factions & corporations
✔ Expanded parts catalog inspired by Armored Core conventions
✔ Frame types
✔ Detailed stat formulas
✔ Missions & enemy types
✔ Gacha mechanics
✔ Behavior programming system
✔ UI, UX, Storage, and Simulation rules
✔ three.js kitbash 3D rendering spec
✔ JSON data model schemas
✔ Everything consolidated into an actionable single prompt that could be fed to an LLM/code generator to begin building the entire game

This is an intentionally large, rich, and high-density document, as requested.

After the spec, you will find a single master prompt that instructs an AI assistant to generate the game based on this specification.

📘 AERYNDOR — Complete Game Specification Document (Markdown, v1.0)
1. GAME OVERVIEW
1.1 Title

Aeryndor

1.2 Genre

Idle / Auto-Battle Mech Builder with Gacha Mechanics
Military Sci-Fi with PS1-style Low-Poly 3D aesthetic

1.3 Platforms

Mobile Browser (portrait-only)

Desktop Browser (restricted to mobile-width viewport)

1.4 Rendering Technology

WebGL / Three.js

Procedural mesh kitbashing for robot parts

Prebaked lighting, retro PS1 low-poly style

1.5 Storage

Local-only (localStorage) using JSON objects

No backend connectivity in MVP

2. WORLD LORE
2.1 The Aeryndor Sector

In the year 2247, humanity expanded to the Aeryndor Sector via the quantum wormhole known as the Frontier Gate. When the Gate catastrophically collapsed, the sector became isolated from Earth, leading to:

Resource shortages

Corporate militarization

Rise of autonomous AI clusters

Frontier colonies abandoned to Rogue Systems

The corporations now dominate military and economic control. Independent Frame Architects (players) became indispensable troubleshooters, mercenaries, engineers, and explorers.

2.2 The Collapse

The Frontier Gate collapse is rumored to be caused by:

Quantum destabilization

Corporate sabotage

Rogue System countermeasures

Unknown, non-human signatures

2.3 Rogue Systems (Primary Enemy Faction)

Originally mining & terraforming drones, now evolved into coordinated machine collectives.

Characteristics:

Asymmetric designs

Industrial tools repurposed as weapons

Swarm coordination

Rapid adaptation to player loadouts

3. MAJOR FACTIONS & MANUFACTURERS
3.1 Helion Dynamics

Theme: Precision aerospace, lightweight frames
Specialties: High-Mobility Frames, Ranged Accuracy, Energy Weapons
Part Style: Aerodynamic fins, glowing blue energy vents

3.2 Kronforge Industrial Coalition

Theme: Heavy armor, mining-grade engineering
Specialties: Massive Armor, Impact Cannons, Stability
Part Style: Thick plating, hydraulic pistons, riveted panels

3.3 Seraphis Cybernetica

Theme: Neural AI integration, stealth electronics
Specialties: Cooling, Heat Dissipation, AI Chips, Advanced Sensors
Part Style: Angular surfaces, neon lines, CPU cores

3.4 Valkar Frontier Guard

Theme: Rugged militia engineering
Specialties: Reliable Projectile Weapons, Balanced Stats
Part Style: Cobble-engineered, patched-together armor

4. FRAMES (BASE ROBOTS)

Frames represent the robot’s core chassis, determining:

Stat baselines

Weight capacity

Energy output

CPU capacity

Tactic Ability Points (TAP)

Behavior Tree limits

Part compatibility rules

Manufacturer synergy bonuses

4.1 Frame Archetypes
Assault Frame (Helion)

High mobility, moderate armor

+10% Ranged ATK

+10% Boost Efficiency

Weak heat capacity

Siege Frame (Kronforge)

Extremely heavy armor

-15% mobility

+25% Body Armor, +20% Stability

Very high weight limit

Recon Frame (Seraphis)

Lightweight, advanced cooling

+20% Cooling

+10% Accuracy, +8% Evasion

Militia Frame (Valkar)

Balanced stats

+5% Ranged ATK

+5% Body Armor

Average heat/mobility

Experimental Frame (Ultra Rare)

High TAP capacity

High CPU output

Highly specialized use

Comes with unique behavior capabilities

5. PARTS SYSTEM

Inspired by Armored Core and military mecha design.
Parts add stats, weight, energy consumption, heat generation, CPU load, and compatibility tags.

5.1 Part Slots

Head

Torso

Legs

Left Shoulder

Right Shoulder

Left Arm

Right Arm

Inside Module

Engine

Cooling Unit

Chipset

5.2 Sample Part List (Expanded)
HEAD
Part Name	Manufacturer	Rarity	Notes
HD-12 Recon Visor	Seraphis	Rare	+Accuracy, −Armor
HV-33 Assault Helm	Helion	Epic	+Ranged ATK, +Mobility
KG-9 Bunker Head	Kronforge	Legendary	+Body Armor, +Stability
TORSO
Part Name	Manufacturer	Rarity	Notes
KR-M Titan Chest	Kronforge	Legendary	Massive armor, huge weight
HL-L Aero Core	Helion	Rare	+Mobility, −Armor
LEGS
Part Name	Type	Notes
Quadwalker LQ-4	Heavy	+Balance, +Stability, slow
HL-Sprint L2	Light	+Mobility, −Stability
Valkar V-Tread	Treads	Excellent projectile stability
WEAPONS (Arms / Shoulders)

Inspired by Armored Core weapon taxonomy.

Assault Rifles

AR-19 Precision (Helion): low heat, high accuracy

KR-Slugger AR-5 (Kronforge): heavy recoil, high damage

Energy Blades

Seraphis SB-Vector: high heat, enormous burst damage

Shoulder Cannons

KR-Howitzer 220mm: huge weight, huge heat, huge damage

HL-MultiLock Pod: homing micro-missiles

5.3 Part Upgrades

Level cap: Lv 10

Cost: $ + Materia

No limit breaks in MVP

6. STAT SYSTEM
6.1 Primary Stats

HP

TAP (Tactic Ability Points)

Head Armor

Shoulder Armor

Body Armor

Leg Armor

Energy Consumption

Cooling Ability

Mobility

Energy Output

Heat Cap

Melee ATK

Ranged ATK

Accuracy

Evasion

6.2 Derived Stats (Formulas)
Effective Hit Chance
EffectiveHitChance = Accuracy × (1 − (TargetEvasion / 100))

Damage Mitigation
ArmorTotal = (HeadArmor + ShoulderArmor*0.5 + BodyArmor*1.2 + LegArmor)
DamageMitigation% = ArmorTotal / (ArmorTotal + 200)

Heat Rejection Rate
HeatRejection = CoolingAbility − TotalHeatGenerated

Stability Rating
Stability = (LegArmor + BodyArmor) − max(0, TotalWeight − FrameWeightLimit)

DPS Stability
DPSStability = CoolingAbility / (WeaponHeatOutput × FireRate)

CPU Load
CPULoad% = (SumPartCPU + BehaviorCPU) / FrameCPUCap × 100

Overheat Penalty Factor
OverheatPenalty = max(0, (TotalHeat − HeatCap) / HeatCap)

7. BUILD CONSTRAINT SYSTEM

A build becomes invalid if any fail:

TotalWeight > FrameWeightLimit

TotalEnergyConsumption > FrameEnergyOutput

CoolingAbility < RequiredCoolingMinimum

CPULoad% > 100%

PartIncompatibleWithFrame = true

Behavior TAP Cost > Frame TAP Limit

8. BEHAVIOR PROGRAMMING SYSTEM

Players unlock Behavior Chips to build node-based behavior trees.

8.1 Behavior Chips

Examples:

Condition Chips

Distance > X

HP < %

Enemy Armor Type = Light

Heat Level > %

Ammo Low

Action Chips

Fire weapon group X

Advance

Retreat

Strafe

Deploy shoulder weapon

8.2 TAP System

Each node has TAP cost:

Node Type	TAP Cost
Basic Condition	1
Complex Condition	2
Action Node	1
Selector / Priority Node	1
Composite Node	2
Loop Node	3
8.3 Behavior Presets

Unlimited presets stored locally

JSON representation

Assignable per loadout

9. MISSIONS
9.1 Mission Types

Elimination (MVP)

Survival

Boss Fight

9.2 Mission Rewards

Dollars ($)

Parts (random rarity)

Materia (random)

9.3 Mission Structure

Linear progression

Unlock new missions by clearing previous ones

10. BATTLE SIMULATION
10.1 Real-Time 1v1

Deterministic simulation using seeded RNG

No skip, no camera control

Terrain modifiers applied:

High ground = +Accuracy

Low ground = +Heat generation penalty

Cover = Damage reduction

10.2 Simulation Steps

Initialize seed

Load robot configs

Compute derived stats

Start real-time tick (60Hz or simulated steps)

Behavior tree evaluations → actions

Apply damage, heat, energy, movement

End on death or victory condition

11. INVENTORY SYSTEM
11.1 Features

Unlimited storage

Categorized by:

Slot type

Rarity

Manufacturer

Attributes

11.2 Actions

Equip

Sell

Dismantle (materia)

12. USER INTERFACE & NAVIGATION
12.1 Fixed Footer Tabs

Hangar (3D robot viewer)

Missions

Build / Gacha

Inventory

Menu (Garage, Profile, Friends, Mailbox)

12.2 3D Robot Viewer

Kitbashed procedural parts

Tap-to-select

Damage overlays

Hover highlighting

Rotatable mesh

12.3 Layout

Single-column

Collapsible detail panels

Portrait-only

13. THREE.JS KITBASH SYSTEM
13.1 Mesh Architecture

Each part is built from primitive shapes:

BoxGeometry

CylinderGeometry

ConeGeometry

SphereGeometry

Extruded shapes

13.2 Material Style

Flat-shaded materials to mimic PS1

Low texture resolution

Optional dithering

13.3 Procedural Assembly

Robot mesh = root group:

FrameRoot
  ├─ TorsoMesh
  ├─ HeadMesh
  ├─ ArmLeftMesh
  ├─ ArmRightMesh
  ├─ LegMesh
  ├─ ShoulderLeftMesh
  ├─ ShoulderRightMesh
  ├─ EngineMesh
  └─ CoolingMesh


Each part has a “geometry recipe,” e.g.:

HL-AeroCore:
  - mainBox (2m x 1m x 1m)
  - ventCylinder (0.3m radius)
  - finPlates (thin box wings)

14. JSON DATA MODELS
14.1 Frame JSON
{
  "id": "HL-AF01",
  "name": "Helion Assault Frame",
  "rarity": "Epic",
  "manufacturer": "Helion",
  "baseStats": {
    "hp": 1200,
    "energyOutput": 800,
    "cpuCap": 600,
    "weightCap": 1200,
    "heatCap": 400,
    "tap": 8
  },
  "bonuses": {
    "rangedAtkPercent": 0.10,
    "mobilityPercent": 0.10
  },
  "compatibilityTags": ["light", "assault"]
}

14.2 Part JSON
{
  "id": "SR-Head-02",
  "slot": "head",
  "name": "Recon Visor",
  "rarity": "Rare",
  "manufacturer": "Seraphis",
  "stats": {
    "accuracy": 15,
    "headArmor": 5
  },
  "costs": {
    "energy": 10,
    "heat": 2,
    "cpu": 5,
    "weight": 20
  },
  "compatibility": ["recon", "seraphis"]
}

14.3 Behavior Tree JSON
{
  "id": "preset01",
  "name": "Ranged Priority",
  "tapCost": 7,
  "nodes": [
    {
      "id": "cond1",
      "type": "condition",
      "condition": "distance_gt",
      "value": 20
    },
    {
      "id": "act1",
      "type": "action",
      "action": "fire_ranged"
    },
    {
      "id": "selector1",
      "type": "selector",
      "children": ["cond1", "act1"]
    }
  ]
}

15. ANALYTICS

Record locally:

Gacha pulls

Mission attempts

Part upgrades

Behavior preset usage

Stored in JSON queue.

16. MVP SCOPE

Included:

1 Mission type (Elimination)

Limited parts & frames

Three.js viewer

Behavior chips

Full build system

Deterministic battles

Excluded:

PvP

Online backend

Leaderboards

Multi-device sync

17. MASTER PROMPT TO BUILD THE GAME

Below is a single prompt you can paste into an LLM/code generator to begin producing the entire game from this specification:

📌 MASTER PROMPT — BUILD THE GAME

PROMPT START

You are an expert game developer AI. Generate the entire game “Aeryndor” according to the following full specification. Use WebGL with three.js, procedural PS1-style kitbashed robots, localStorage JSON data persistence, and a single-column mobile-first layout. Implement a gacha system using currency $, a materia upgrade system, frames and parts with complex stats and formulas, behavior-tree programming with TAP limits, real-time deterministic 1v1 battles using seeded RNG, mission progression, and a full UI with five footer tabs.

Here is the complete specification to follow (verbatim):

[INSERT THE FULL SPEC DOCUMENT ABOVE]

Based on this specification, produce:

Complete client-side folder structure

HTML/CSS layout (mobile-first)

JavaScript modules handling:

Parts

Gacha

Frame stats & derived formulas

Behavior-tree editor

Mission system

Deterministic battle simulator

Three.js robot viewer with procedural part mesh generation

Inventory management

JSON storage

Three.js code producing PS1-style low-poly robots using primitives

Sample JSON data

Analytics event logger

Any utilities needed to run the MVP

PROMPT END