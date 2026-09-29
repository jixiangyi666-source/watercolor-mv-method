# V5 渲染交接说明

## 当前状态

V5 老水手模块已完成人物结构、面部、油布外套、风雨细节与关键帧 QA，并已完成整片 3067 帧渲染和编码。

## 成片规格

- 分辨率：1920×1080
- 帧率：24fps
- 总帧数：3067
- 时长：127.792 秒
- 视频编码：H.264，CRF 17，preset slow
- 音频：AAC，目标 192 kbps
- 完整解码校验：通过

## 渲染环境

需要：

- Node.js
- Google Chrome
- ffmpeg
- `npm install`

如 Chrome 不在默认位置，可传：

```powershell
node render.mjs --chrome="<Chrome 路径>"
```

如 ffmpeg 不在 PATH 中，可先把工具目录加入 PATH：

```powershell
$env:PATH="<ffmpeg 所在目录>;" + $env:PATH
```

## 渲染命令

### 1. 渲染关键帧

```powershell
node render.mjs --sheet=26,37,45,54,103,110 --cols=3 --w=560 --out=out/check/v5_qa_sheet.jpg
```

### 2. 渲染整片帧序列

```powershell
node render.mjs --frames --workers=4
```

帧序列输出到：

```text
out/frames
```

### 3. 编码

```powershell
node render.mjs --encode --out=out/video_v5.mp4 --audio=assets/shuishou.m4a
```

## 重点复查时间

- 26s：金色梦境
- 37s：远景剪影
- 40–57s：风暴
- 54s：浪后擦脸
- 98–112s：梦境
- 110s：轻雨微风
- 全部转场
- 卡拉OK歌词
- 音画同步

## 本仓库的排除项

以下内容不适合直接放入 GitHub 仓库：

- `assets/shuishou.m4a`
- `out/video_v5.mp4`
- V4/V5 成片
- 大体积帧序列

可将其放在本地同级目录或私有归档中，再按上述命令渲染。