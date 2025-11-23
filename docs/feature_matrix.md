# 功能矩阵 (Feature Matrix)

| 状态 | 功能模块 | 描述 | 核心文件路径 |
| :--- | :--- | :--- | :--- |
| ✅ | **Landing Page** | 初始引导页，包含视觉特效和跳过登录功能。 | `src/components/LandingPage.tsx` |
| ✅ | **Mode Select** | 游戏模式选择（Game Mode / Editor Mode）。 | `src/components/ModeSelectPage.tsx` |
| ✅ | **Song Select** | 歌曲选择轮播图，支持键盘左右切换和确认。 | `src/components/SongSelect.tsx`, `src/data/songs.ts` |
| ✅ | **Song Detail** | 歌曲详情页，展示 BPM、难度，支持调节游戏速度 (1-10)。 | `src/components/SongDetail.tsx` |
| ✅ | **Game Core (3D)** | 核心游戏场景，包含轨道、判定线、音符 (Note) 的 3D 渲染与运动逻辑。 | `src/components/GameScene.tsx`, `src/components/Note.tsx` |
| ✅ | **Game UI (HUD)** | 游戏界面 HUD，显示分数、连击 (Combo)、判定反馈 (Perfect/Good/Miss)。 | `src/components/GamePage.tsx` |
| ✅ | **Game Logic** | 判定逻辑、计时器、输入处理。 | `src/store/gameStore.ts`, `src/hooks/useInput.ts`, `src/utils/judgment.ts` |
| ✅ | **Result Page** | 结算页面，展示评级 (S/A/B/C)、准确率、详细判定统计。 | `src/components/ResultPage.tsx` |
| 🚧 | **Editor Core** | 谱面编辑器。支持波形(模拟)、网格吸附、多选拖拽、复制粘贴、镜像、删除。 | `src/components/EditorPage.tsx`, `src/store/editorStore.ts` |
| ✅ | **Audio System** | 音频播放、点击音效 (Hit Sound) 合成。 | `src/utils/audio.ts` |

