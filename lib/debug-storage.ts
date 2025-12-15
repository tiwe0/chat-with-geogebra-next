/**
 * 调试工具 - 检查 localStorage 中的对话保存状态
 * 
 * 在浏览器控制台运行此代码来检查保存的数据
 */

// 获取保存的数据
function checkSavedData() {
  const savedData = localStorage.getItem('llm-chat-storage')
  
  if (!savedData) {
    console.log('❌ 没有找到保存的数据')
    return
  }
  
  try {
    const data = JSON.parse(savedData) as any
    console.log('✅ 找到保存的数据:')
    console.log('-------------------')
    console.log('版本:', data.version)
    console.log('对话数量:', data.state?.conversations?.length || 0)
    console.log('活动对话ID:', data.state?.activeConversationId)
    
    if (data.state?.conversations) {
      console.log('\n对话列表:')
      data.state.conversations.forEach((conv: any, idx: number) => {
        const messageCount = data.state.messages?.[conv.id]?.length || 0
        console.log(`  ${idx + 1}. ${conv.title} (ID: ${conv.id}, 消息数: ${messageCount})`)
      })
    }
    
    if (data.state?.messages) {
      console.log('\n消息详情:')
      Object.entries(data.state.messages).forEach(([convId, messages]: [string, any]) => {
        console.log(`  对话 ${convId}:`, messages.length, '条消息')
        if (messages.length > 0) {
          console.log(`    最新消息:`, messages[messages.length - 1].content.substring(0, 50) + '...')
        }
      })
    }
    
    console.log('\n完整数据:')
    console.log(data)
    
  } catch (error) {
    console.error('❌ 解析数据出错:', error)
  }
}

// 清空保存的数据
function clearSavedData() {
  localStorage.removeItem('llm-chat-storage')
  console.log('✅ 已清空保存的数据')
}

// 导出工具函数
if (typeof window !== 'undefined') {
  (window as any).checkSavedData = checkSavedData;
  (window as any).clearSavedData = clearSavedData
  
  console.log('🔧 调试工具已加载')
  console.log('使用方法:')
  console.log('  checkSavedData()  - 检查保存的数据')
  console.log('  clearSavedData()  - 清空保存的数据')
}

export { checkSavedData, clearSavedData }
