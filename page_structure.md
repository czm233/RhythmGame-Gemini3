# Page Structure Hierarchy

This document defines the navigation flow and hierarchy of the Rhythm Game application.

## Tree Structure

```
App (Root)
├── LandingPage (初始/登录界面)
│   ├── QR Code (Mock Login)
│   └── Skip Button -> Go to ModeSelectPage
│
├── ModeSelectPage (模式选择界面)
│   ├── Game Mode Card -> Go to SongSelect
│   └── Editor Mode Card -> Go to EditorPage
│
├── EditorPage (写谱器界面 - Placeholder)
│   └── Navigation: Back -> Go to ModeSelectPage
│
├── SongSelect (选歌界面)
│   ├── Infinite Carousel (Song Cards)
│   └── Navigation: Click Card -> Go to SongDetail
│
├── SongDetail (歌曲详情/准备界面)
│   ├── Song Info (Title, Artist, Difficulty)
│   ├── Speed Control (Slider)
│   ├── Start Button -> Go to GamePage
│   └── Back Button -> Go to SongSelect
│
└── GamePage (游戏界面)
    ├── GameScene (3D Gameplay)
    ├── HUD (Score, Combo)
    └── Navigation: 
        ├── Escape/Back -> Go to SongSelect
        └── Game End -> Go to ResultPage

└── ResultPage (结算界面)
    ├── Song Card & Rank (S/A/B/C)
    ├── Stats (Score, Perfect/Good/Miss, Max Combo, Accuracy)
    └── Navigation: Skip/Back -> Go to SongSelect
```

## Screen Definitions

1.  **SongSelect (选歌界面)**:
    -   **Purpose**: Browse and select a track to play.
    -   **Key Features**: Infinite 3D Carousel ("Podium" layout), Background ambience.
    -   **Interaction**: Swipe/Arrow keys to browse, Click center item to select.

2.  **SongDetail (歌曲详情界面)**:
    -   **Purpose**: Configure game settings before starting.
    -   **Key Features**: Large cover art, Speed adjustment, Difficulty display.
    -   **Interaction**: Adjust speed, Start Game.

3.  **GamePage (游戏界面)**:
    -   **Purpose**: Core gameplay loop.
    -   **Key Features**: Falling notes, Judgment line, Score display.
    -   **Interaction**: Keyboard input (D, F, J, K).

4.  **ResultPage (结算界面)**:
    -   **Purpose**: Display game results and statistics.
    -   **Key Features**: Rank badge, Score breakdown, Accuracy circle.
    -   **Interaction**: View stats, Return to SongSelect.

5.  **LandingPage (初始/登录界面)**:
    -   **Purpose**: Entry point, user authentication (mock).
    -   **Key Features**: QR Code, Skip button.
    -   **Interaction**: Scan/Skip to enter.

6.  **ModeSelectPage (模式选择界面)**:
    -   **Purpose**: Choose between playing and creating.
    -   **Key Features**: Two large cards (Game Mode, Editor Mode).
    -   **Interaction**: Select mode.

7.  **EditorPage (写谱器界面)**:
    -   **Purpose**: Create and edit beatmaps (Future).
    -   **Key Features**: Placeholder for now.
