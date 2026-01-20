import request from './api'
import { ElMessage } from 'element-plus'

// 工具栏配置
export const toolbarConfig = {
  excludeKeys: ['fullScreen', 'code', 'codeBlock']
}

// 编辑器配置
export const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: `${request.defaults.baseURL}/upload/image`,
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      // 自定义上传成功处理
      customInsert(res, insertFn) {
        // 从后端返回的结果中获取图片URL
        const url = res.data.url
        // 使用insertFn插入图片
        insertFn(url)
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