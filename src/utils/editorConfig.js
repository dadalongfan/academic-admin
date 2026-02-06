import request from './api'
import { ElMessage } from 'element-plus'

// 工具栏配置
export const toolbarConfig = {
  excludeKeys: ['fullScreen', 'code', 'codeBlock']
}

// 图片管理工具
export const imageManager = {
  // 为每个编辑器实例维护独立的图片列表
  editorImagesMap: new WeakMap(),
  
  // 检查编辑器中的图片删除
  checkImagesDeletion: (editor) => {
    if (!editor) return
    
    const html = editor.getHtml()
    // 从HTML中提取所有图片URL
    const newImages = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const imgElements = doc.querySelectorAll('img')
    imgElements.forEach(img => {
      let src = img.getAttribute('src')
      // 如果是完整URL，提取相对路径
      if (src && src.startsWith(request.defaults.baseURL)) {
        src = src.replace(request.defaults.baseURL, '')
      }
      if (src && src.startsWith('/uploads/images/')) {
        newImages.push(src)
      }
    })
    
    // 获取该编辑器之前的图片列表
    const oldImages = imageManager.editorImagesMap.get(editor) || []
    // 检测被删除的图片
    const deletedImages = oldImages.filter(img => !newImages.includes(img))
    
    // 如果有图片被删除，调用后端API删除本地文件
    if (deletedImages.length > 0) {
      deletedImages.forEach(imgUrl => {
        // 调用后端API删除本地文件
        request.delete(`/upload/file?url=${encodeURIComponent(imgUrl)}`)
          .then(response => {
            if (response.code === 200) {
              console.log('图片删除成功:', imgUrl)
            } else {
              console.error('图片删除失败:', imgUrl, response.message)
            }
          })
          .catch(error => {
            console.error('删除图片时发生错误:', imgUrl, error)
          })
      })
    }
    
    // 更新该编辑器的图片列表
    imageManager.editorImagesMap.set(editor, newImages)
  },
  
  // 初始化编辑器中的图片列表
  initEditorImages: (editor) => {
    if (!editor) return
    
    const html = editor.getHtml()
    // 从HTML中提取所有图片URL
    const newImages = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const imgElements = doc.querySelectorAll('img')
    imgElements.forEach(img => {
      let src = img.getAttribute('src')
      // 如果是完整URL，提取相对路径
      if (src && src.startsWith(request.defaults.baseURL)) {
        src = src.replace(request.defaults.baseURL, '')
      }
      if (src && src.startsWith('/uploads/images/')) {
        newImages.push(src)
      }
    })
    
    // 存储该编辑器的图片列表
    imageManager.editorImagesMap.set(editor, newImages)
    console.log('初始化编辑器图片列表:', newImages)
  },
  
  // 重置指定编辑器的图片列表
  resetImages: (editor) => {
    if (editor) {
      imageManager.editorImagesMap.delete(editor)
      console.log('重置编辑器图片列表')
    }
  }
}

// 编辑器配置
export const editorConfig = {
  placeholder: '请输入内容...',
  // 编辑器错误处理配置，避免因内部状态不一致而崩溃
  onError: (errorType, detail) => {
    console.error('编辑器错误:', errorType, detail);
    // 忽略特定的路径访问错误，避免编辑器崩溃
    // 这种错误通常是由于编辑器内部状态与实际DOM结构不一致导致的
    if (errorType.includes('Cannot find a descendant at path')) {
      console.log('忽略编辑器路径访问错误，避免崩溃:', errorType);
      return; // 忽略这个错误，避免编辑器崩溃
    }
  },
  // 编辑器内容变更前的处理，避免无效操作
  beforeChange: (context) => {
    // 检查操作类型，如果是路径访问相关的操作，进行额外的检查
    const { type } = context;
    if (type === 'insertFragment' || type === 'deleteBackward' || type === 'deleteForward') {
      // 尝试修复编辑器内部状态
      try {
        // 检查节点路径是否有效
        const { selection } = context;
        if (selection) {
          const { path } = selection.anchor;
          // 如果路径不存在或无效，重置选择
          if (path && (path.length === 0 || path[0] >= context.doc.children.length)) {
            // 重置选择到文档开头
            return {
              selection: {
                anchor: { path: [0, 0], offset: 0 },
                focus: { path: [0, 0], offset: 0 }
              }
            };
          }
        }
      } catch (e) {
        console.error('修复编辑器状态失败:', e);
        // 如果修复失败，重置选择到文档开头
        return {
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 }
          }
        };
      }
    }
    return true;
  },
  // 监听内容变化事件，用于检测图片删除
  onchange: (editor) => {
    // 使用imageManager的checkImagesDeletion函数检查图片删除
    imageManager.checkImagesDeletion(editor)
  },
  MENU_CONF: {
    uploadImage: {
      server: `${request.defaults.baseURL}/upload/image`,
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      // 自定义上传成功处理
      customInsert: function(res, insertFn) {
        // 从后端返回的结果中获取图片URL
        let url = res.data.url
        // 检查是否为相对路径，如果是则转换为完整URL
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = `${request.defaults.baseURL}${url}`
        }
        // 使用insertFn插入图片
        insertFn(url)
        // 添加到当前图片列表
        if (url) {
          // 从完整URL中提取相对路径用于管理
          let relativeUrl = url
          if (url.startsWith(request.defaults.baseURL)) {
            relativeUrl = url.replace(request.defaults.baseURL, '')
          }
          if (relativeUrl.startsWith('/uploads/images/') && !imageManager.currentImages.includes(relativeUrl)) {
            imageManager.currentImages.push(relativeUrl)
          }
        }
      },
      onSuccess: (result, file) => {
        console.log('上传成功', result, file)
      },
      onFailed: (result, file) => {
        console.error('上传失败', result, file)
        ElMessage.error('图片上传失败：' + (result?.message || '未知错误'))
      }
    }
  }
}