# 火麒麟 · 程序化 3D 外观草模

这是按 CF 火麒麟视觉参考制作的粉丝重建草模，非游戏原版资产。

## 使用

- 双击 index.html，用现代浏览器打开。该文件自包含，无需安装依赖、启动服务器或联网。
- 拖动旋转、滚轮或双指缩放。可切换观察视角、线框、自动旋转、部件展开，点击查看部件名。
- models/fire-kirin.glb 可直接导入 Blender、Three.js 或其他支持 glTF 2.0 的工具。
- 模型有 104 个可见网格、约 39,984 个三角面、7 个材质、2 张内嵌纹理。坐标为任意展示单位，不代表实物尺寸。

## 源码

src/createFireKirinModel.ts 由 img2threejs v2.0.0 流程生成并修正。
src/viewer.ts 含轮廓校正、参考纹理草案与交互。
object-sculpt-spec.json 保存部件、材料、来源和评审记录。

执行 npm install 和 npm run build，打开 dist/index.html。构建后的 dist 可部署到静态托管或 Nginx。

## 验证与限制

已验证浏览器无运行时异常、390px 手机布局无横向溢出、交互视角切换、部件展开和 GLB 导出。

img2threejs 规格严格检查通过，但轮廓/外观检查未通过，流水线仍停留在 blockout。后续阶段未被标记为验收通过。当前配色与兽首纹理是供查看的草案，不代表材料或投影验收完成。

兽首体积与雕纹明显简化；头部参考纹理仅近似贴合；背面和遮挡部位按对称关系推测。模型不包含真实功能机构。源码保留未通过的检查记录，不将草模描述为游戏级成品。

img2threejs 上游：https://github.com/img2threejs/img2threejs
流程：https://github.com/img2threejs/img2threejs/blob/main/SKILL.md
参考：https://images.17173.com/2012/news/2012/12/21/2012cpb1221ax02s.jpg
补充参考：https://i2.hdslb.com/bfs/archive/48f58ee5950d9303bc3c360383425e617733c79d.jpg

Three.js 采用 MIT 许可；img2threejs 代码采用 Apache-2.0，许可附于 IMG2THREEJS-LICENSE.txt。游戏武器设计和参考图权利归原权利方。

## 在线预览

https://fire-kirin-model-preview.chicloom5.chatgpt.site/ （私密页面，需要对应 ChatGPT 账号登录）
