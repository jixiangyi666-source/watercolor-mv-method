# Watercolor MV Method

一个公开的“手绘水彩 MV 制作方法包”，用于让别人根据提示词和流程复现同类效果。

本仓库刻意不包含完整工程源码、音频、歌词、成片、帧序列、第三方示例角色或原项目历史，目的是分享可复用的创作方法和 QA 流程。

## 目录

```text
README.md
REPRODUCE_PROMPT.md
docs/
  render-workflow.md
  effect-spec.md
  qa-checklist.md
  storyboard-template.md
  repo-content-policy.md
prompts/
  reproduce-prompt.md
qa/
  sailor_v5_face.jpg
  sailor_v5_face2.jpg
  v5head45.jpg
  v5head54.jpg
```

## 快速开始

1. 阅读 `REPRODUCE_PROMPT.md`。
2. 将其中整段提示词复制给支持本地文件读写的编码代理。
3. 准备你自己拥有授权的音频、歌词和分镜。
4. 要求代理先输出镜头表、调色板、角色设定、关键帧计划和 QA 计划，确认后再写代码。
5. 按 `docs/render-workflow.md` 的流程分阶段渲染、检查、编码。

## 核心效果目标

- 1920×1080，24fps，约 2 分钟。
- 平面 2D 手绘水彩，不用 3D 渲染。
- 墨线轻微“沸腾”，纸张颗粒和水彩边缘稳定存在。
- 每一帧都是时间 `t` 的确定性函数，便于并行渲染和续渲。
- 每个镜头都有事件、动作和情绪变化。
- 静止画面仍保留呼吸、风、雨、水波、布料或光影微动。
- 输出 H.264 / CRF17 / slow / AAC 192kbps / faststart MP4。

## 版权与授权

- 本仓库不提供《水手》音频、歌词或成片。
- `qa/` 中的图片仅作为方法说明和视觉 QA 示例，不授权他人直接再利用。
- 仓库许可证待确认；在未添加许可证前，默认保留所有权利。
- 使用者必须自行准备音频、歌词、字体、角色和图像素材的授权。

