削峰限流??

搞个消息队列?



# why

不知道为什么, 做了蛮有意思



# What

全局消息队列

改一下 upload 方法, upload 将参数固定好然后 push 进 mq

由 mq 来管理实际的数据发送

超过限制长度,就特殊处理



SDK 做这么多事情影响宿主页面性能

而且由 mq 管理数据发送, 就无法保证一定会发送, 请求的可靠性不足
