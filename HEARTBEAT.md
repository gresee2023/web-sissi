# HEARTBEAT.md

## OpenClaw 服务稳定性监控

### 每日检查任务（每次心跳执行）

1. **网关状态检查**
   - 执行命令：`openclaw gateway status`
   - 期望结果：包含"Listening: 127.0.0.1:18789"和"RPC probe: ok"
   - 异常处理：如果不匹配，尝试 `openclaw gateway restart`

2. **模型API连通性检查**
   - 执行命令：`openclaw models status --timeout 10`
   - 检查项目：
     - bailian provider 状态正常（API key有效）
     - custom-api-deepseek-com provider 状态正常
     - ollama provider 状态正常（本地模型备用）
   - 异常处理：记录警告，尝试重新配置或切换后备模型

3. **专家模型分配验证**
   - 检查各专家agent是否使用正确的专用模型：
     - 虾米（main）：DeepSeek Reasoner
     - 小心（xiaoxin）：MiniMax-M2.5
     - 小品（xiaopin）：kimi-k2.5  
     - 小财（xiaocai）：glm-5
     - 小健（xiaojian）：qwen3-max-2026-01-23
   - 验证方法：检查配置文件中的agent.model.primary字段

4. **服务日志检查**
   - 检查最近日志中的错误：`Get-Content "$env:USERPROFILE\AppData\Local\Temp\openclaw\*.log" -Tail 10`
   - 关注关键词："error", "failed", "timeout", "disconnected"

### 执行频率
- 每日2-4次（根据心跳配置）
- 北京时间白天时段优先（08:00-23:00）
- 避免深夜频繁检查（23:00-08:00）

### 报告机制
- **正常情况**：HEARTBEAT_OK（保持静默）
- **异常情况**：报告具体问题及已采取的修复措施
- **紧急情况**：立即通知用户（非心跳时间也可主动提醒）

### 修复优先级
1. 网关未运行 → 立即重启
2. 单个模型API失效 → 切换到后备模型
3. 配置文件错误 → 恢复最近备份
4. 计划任务失效 → 重新安装计划任务

---
*最后更新：2026-03-02*
*配置人：虾米（OpenClaw助手）*
