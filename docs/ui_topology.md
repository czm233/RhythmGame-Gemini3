# UI 拓扑图 (UI Topology)

## 根节点: 应用入口
- **路径**: `src/App.tsx`
- **职责**: 简单的状态路由 (Screen Router)，管理当前显示的页面组件。
- **状态**: `screen` ('LANDING' | 'MODE_SELECT' | 'EDITOR' | 'SELECT' | 'DETAIL' | 'GAME' | 'RESULT')

## 页面 1: 落地页 (LandingPage)
- **路径**: `src/components/LandingPage.tsx`
- **UI特征**: 背景动画，模拟 QR 登录框，跳过按钮。

## 页面 2: 模式选择 (ModeSelectPage)
- **路径**: `src/components/ModeSelectPage.tsx`
- **UI特征**: 两个巨大的卡片 (Game Mode / Editor Mode)，3D 倾斜效果 (Hover)。

## 页面 3: 选歌页面 (SongSelect)
- **路径**: `src/components/SongSelect.tsx`
- **UI特征**: 3D 轮播图 (Carousel)，中心放大，两侧透明度降低。
- **交互**: 键盘左右箭头切换，Enter/Space 确认。

## 页面 4: 歌曲详情 (SongDetail)
- **路径**: `src/components/SongDetail.tsx`
- **UI特征**: 歌曲封面色块，BPM/难度展示，速度调节滑块 (Range Input)。

## 页面 5: 游戏主界面 (GamePage)
- **路径**: `src/components/GamePage.tsx`
- **包含组件**:
  - **HUD Layer** (DOM):
    - Score Display (左上角)
    - Combo Display (屏幕中央)
    - Judgment Feedback (屏幕中央偏下)
    - Pause/Start Overlay
  - **3D Scene Layer** (Canvas):
    - 组件: `GameScene` (`src/components/GameScene.tsx`)
      - `LaneVisuals`: 轨道和判定线模型。
      - `GameLogic`: 负责 `useFrame` 循环和 Note 生成。
      - `Note`: (`src/components/Note.tsx`) 单个音符的 3D 表现 (BoxGeometry)。

## 页面 6: 结算页面 (ResultPage)
- **路径**: `src/components/ResultPage.tsx`
- **UI特征**: 评级大字 (S/A/B...)，详细数据统计 (Perfect/Good/Miss)，环形图展示 (Combo/Accuracy)。

## 页面 7: 编辑器 (EditorPage)
- **路径**: `src/components/EditorPage.tsx`
- **布局**:
  - **Top Bar**: 返回按钮，文件名，播放控制，导出/导入按钮。
  - **Left Sidebar**: 工具箱 (Snap设置, Zoom设置, Note颜色选择, 音效设置)。
  - **Center Area**: 
    - **Track Area**: 垂直滚动的轨道区域，包含网格线和 Note DOM 元素。
    - **Judgment Line**: 固定在底部的判定线。
  - **Right Sidebar**: 属性面板 (选中 Note 的详细信息修改)。

