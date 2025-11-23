# 数据流向图 (Data Flow)

## 核心架构
项目主要依赖 **Zustand** 进行全局状态管理，分为 **游戏状态 (Game Store)** 和 **编辑器状态 (Editor Store)**。

## 1. 游戏循环数据流 (Game Loop)

```mermaid
graph TD
    Input[用户输入 (Keyboard)] -->|useInput Hook| GameStore
    Timer[Timer Utils] -->|gameTimer.getTime()| GameLogic
    
    subgraph GlobalStore [useGameStore]
        State_Time[currentTime]
        State_Notes[notes array]
        State_Score[score / combo]
        Action_Hit[handleHit]
        Action_Miss[handleMiss]
    end
    
    subgraph RenderLoop [React Three Fiber / useFrame]
        GameLogic[GameLogic Component]
        NoteComp[Note Component]
    end
    
    GameLogic -->|每帧读取时间| Timer
    GameLogic -->|updateTime| State_Time
    GameLogic -->|检查 Miss| Action_Miss
    
    State_Time -->|Subscribe| NoteComp
    NoteComp -->|根据 Time 计算 Z轴位置| 3D_Scene
    
    Input -->|判定 Hit| Action_Hit
    Action_Hit -->|更新| State_Score
    Action_Hit -->|标记 Note 为 hit| State_Notes
```

## 2. 输入判定流 (Judgment Flow)

1.  **Event**: `useInput.ts` 监听 `keydown`。
2.  **Query**: 根据按键映射 (key -> lane) 在 `gameStore.notes` 中查找当前轨道最近的、未击中的 Note。
3.  **Check**: 计算 `Math.abs(note.time - currentTime)`。
4.  **Judgment**: 调用 `src/utils/judgment.ts` 获取判定结果 (PERFECT / GOOD / MISS)。
5.  **Action**: 调用 `gameStore.handleHit(noteId, result)` 或 `handleMiss`。
6.  **Feedback**: 更新 `lastJudgment` 状态 -> 触发 `GamePage` UI 动画；播放 Hit Sound (`src/utils/audio.ts`).

## 3. 编辑器数据流 (Editor Flow)

- **Store**: `useEditorStore` (`src/store/editorStore.ts`)
- **Interaction**:
  - **Mouse Move/Up/Down**: 直接在 `EditorPage.tsx` 中计算坐标，转换为 time/lane。
  - **Actions**: 调用 `addNote`, `updateNote`, `selectNote` 更新 Store 中的 `notes` 数组。
- **Playback**:
  - 音频播放 (`<audio>`) 作为主时钟源。
  - `requestAnimationFrame` 循环同步 `currentTime` 到 Store。
  - `currentTime` 驱动轨道区域的 `transform: translateY(...)` 实现滚动。

## 4. 核心数据结构

### Note (src/types/game.ts)
```typescript
interface Note {
    id: string;
    time: number;      // 击打时间点 (ms)
    lane: number;      // 轨道索引 (0-3)
    type: 'tap' | 'hold';
    color: 'blue' | 'pink';
    hit: boolean;      // 运行时状态
    missed: boolean;   // 运行时状态
}
```

### Song (src/types/game.ts)
```typescript
interface Song {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    difficulty: string;
    color: string;     // 主题色
}
```

