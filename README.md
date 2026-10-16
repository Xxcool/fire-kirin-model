# 火麒麟 · Fire Kirin

基于 CF「AK47-火麒麟」外观参考制作的交互式 3D 展示。使用 img2threejs、Three.js 和 TypeScript 构建，支持在浏览器里旋转观察、展开部件和导出模型。

> 当前为粉丝制作的外观草模，非游戏原版资产。兽首雕纹与隐藏面仍有简化，适合展示、学习和继续建模。

**[下载 GLB 模型](models/fire-kirin.glb)** · **[查看建模源码](src/createFireKirinModel.ts)**

## 在线预览

**[打开在线预览 →](https://xxcool.github.io/fire-kirin-model/)**

由 GitHub Pages 托管，无需登录或安装。打开即可旋转查看模型、切换视角和下载 GLB。

发布源：**main / (root)**。

后续提交到 main 的网页更新会自动发布。仓库根目录的 `index.html` 是已构建好的完整页面。

## 可以做什么

- **自由观察**：拖动旋转，滚轮或双指缩放。
- **切换视角**：立体、侧面、背面、兽首细节。
- **检查结构**：线框模式、自动旋转、部件展开；点击模型查看部件名称。
- **保存成果**：下载 GLB 模型，或将当前画面保存为 PNG。
- **手机访问**：页面适配窄屏，支持触控操作。

## 本地打开

只想看效果：下载仓库 ZIP，解压后用现代浏览器打开根目录的 **index.html**。页面已内嵌脚本和纹理，无需安装依赖。

需要修改源码：

```bash
git clone https://github.com/Xxcool/fire-kirin-model.git
cd fire-kirin-model
npm install
npm run build
```

构建结果为 `dist/index.html`，可直接用浏览器打开。使用根目录作为 GitHub Pages 发布源时，将更新后的 `dist/index.html` 复制到根目录的 `index.html`，再提交到 main。

## 项目结构

| 文件 | 用途 |
| --- | --- |
| `index.html` | 可直接打开和部署的完整展示页 |
| `src/createFireKirinModel.ts` | 程序化模型与材质 |
| `src/viewer.ts` | 场景、外观修正、交互与导出 |
| `viewer-template.html` | 页面布局与样式 |
| `models/fire-kirin.glb` | 可导入 Blender / Three.js 的模型 |
| `textures/` | 参考投影纹理 |
| `build.mjs` | 打包脚本 |
| `object-sculpt-spec.json` | 建模规格与部件记录 |
| `evidence/` | 诊断与检查记录 |

## 模型信息

| 项目 | 当前版本 |
| --- | --- |
| 可见网格 | 104 |
| 三角面 | 约 39,984 |
| 材质 | 7 |
| 内嵌纹理 | 2 |
| 导出格式 | GLB / glTF 2.0 |
| 技术 | Three.js · TypeScript · esbuild |

模型使用展示单位，不代表实物尺寸。兽首体积与雕纹、参考纹理贴合仍需改进；背面和遮挡部位按视觉关系推测补全。目前尚未通过轮廓与外观验收。

## 参考与致谢

- [img2threejs](https://github.com/img2threejs/img2threejs)：程序化建模流程。
- [Three.js](https://threejs.org/)：浏览器 3D 渲染与模型导出。
- [主要外观参考](https://images.17173.com/2012/news/2012/12/21/2012cpb1221ax02s.jpg) · [补充参考](https://i2.hdslb.com/bfs/archive/48f58ee5950d9303bc3c360383425e617733c79d.jpg)

Three.js 使用 MIT 许可；img2threejs 的 Apache-2.0 许可见 [IMG2THREEJS-LICENSE.txt](IMG2THREEJS-LICENSE.txt)。游戏武器设计和参考图片的权利归各自权利方，以上依赖许可不代表授予这些素材的使用权。
