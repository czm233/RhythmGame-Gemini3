# Page Structure Hierarchy

This document defines the navigation flow and hierarchy of the Rhythm Game application.

## Tree Structure

```
App (Root)
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
