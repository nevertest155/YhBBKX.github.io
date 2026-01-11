// ====== YhBBKX 智能预加载管理器 ======
// 版本：1.1.0
// 特点：8秒超时跳过、失败提示、优雅降级
// 作者：Never155
// 日期：2026年

class SmartPreloader {
    constructor() {
        // 超时时间（毫秒）
        this.TIMEOUT = 8000;
        
        // 资源列表（按优先级排序）
        this.resources = [
            // 关键资源 - 高优先级
            {
                id: 'logo-32',
                url: 'https://raw.githubusercontent.com/nevertest155/YhBBKX.github.io/refs/heads/main/Minecraft%20Yh%20for%20Beta_Beta11.29%EF%BC%881.21.130.28%EF%BC%89.apk_icon.png',
                type: 'image',
                priority: 'critical',
                fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzY3QzhGRiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Ikdvb2dsZSBTYW5zIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSI+WUg8L3RleHQ+Cjwvc3ZnPg=='
            },
            {
                id: 'logo-160',
                url: 'https://raw.githubusercontent.com/nevertest155/YhBBKX.github.io/refs/heads/main/Minecraft%20Yh%20for%20Beta_Beta11.29%EF%BC%881.21.130.28%EF%BC%89.apk_icon.png',
                type: 'image',
                priority: 'critical',
                fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiByeD0iMjQiIGZpbGw9IiM2N0M4RkYiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJHb29nbGUgU2FucyIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5ZSDwvdGV4dD4KPC9zdmc+'
            },
            
            // 字体资源 - 中优先级
            {
                id: 'material-icons',
                url: 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined',
                type: 'font',
                priority: 'high'
            },
            {
                id: 'google-sans',
                url: 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;700&display=swap',
                type: 'font',
                priority: 'high'
            }
        ];
        
        // 状态追踪
        this.state = {
            isLoading: false,
            isComplete: false,
            failedResources: [],  // 存储失败资源
            startTime: 0,
            endTime: 0,
            timeoutIds: []  // 存储所有超时ID便于清理
        };
        
        // 缓存已加载资源
        this.cache = new Map();
        
        console.log('🚀 [SmartPreloader] 初始化完成，超时时间:', this.TIMEOUT + 'ms');
    }
    
    // ====== 核心API ======
    
    /**
     * 开始预加载所有资源
     */
    async startPreloading() {
        if (this.state.isLoading) {
            console.warn('⚠️ [SmartPreloader] 已经在加载中');
            return;
        }
        
        console.log('🔄 [SmartPreloader] 开始预加载资源...');
        this.state.isLoading = true;
        this.state.isComplete = false;
        this.state.failedResources = [];
        this.state.startTime = performance.now();
        this.state.timeoutIds = [];
        
        // 清理旧缓存
        this.cache.clear();
        
        try {
            // 按优先级分组加载
            await this.loadByPriority();
            
            this.state.isLoading = false;
            this.state.isComplete = true;
            this.state.endTime = performance.now();
            
            const loadTime = this.state.endTime - this.state.startTime;
            console.log(`✅ [SmartPreloader] 预加载完成，耗时: ${loadTime.toFixed(0)}ms`);
            console.log(`📊 失败资源数: ${this.state.failedResources.length}`);
            
            // 如果有失败资源，显示提示框
            if (this.state.failedResources.length > 0) {
                setTimeout(() => {
                    this.showFailureNotification();
                }, 500); // 稍等500ms，确保页面渲染完成
            }
            
        } catch (error) {
            console.error('❌ [SmartPreloader] 预加载过程出错:', error);
            this.state.isLoading = false;
        } finally {
            // 清理所有超时定时器
            this.state.timeoutIds.forEach(id => clearTimeout(id));
        }
    }
    
    /**
     * 检查预加载状态
     */
    getStatus() {
        return {
            isLoading: this.state.isLoading,
            isComplete: this.state.isComplete,
            failedCount: this.state.failedResources.length,
            failedResources: [...this.state.failedResources],
            loadTime: this.state.endTime - this.state.startTime
        };
    }
    
    // ====== 私有方法 ======
    
    /**
     * 按优先级分组加载资源
     */
    async loadByPriority() {
        // 按优先级分组
        const critical = this.resources.filter(r => r.priority === 'critical');
        const high = this.resources.filter(r => r.priority === 'high');
        const medium = this.resources.filter(r => r.priority === 'medium');
        const low = this.resources.filter(r => r.priority === 'low');
        
        console.log(`📦 [SmartPreloader] 资源分组: critical=${critical.length}, high=${high.length}`);
        
        // 按顺序加载（但每组内并行）
        await this.loadResourceGroup(critical, '关键资源');
        await this.loadResourceGroup(high, '重要资源');
        // 中低优先级可以异步加载，不等待
        this.loadResourceGroup(medium, '中等资源').catch(() => {});
        this.loadResourceGroup(low, '低优先级资源').catch(() => {});
    }
    
    /**
     * 加载一组资源
     */
    async loadResourceGroup(resources, groupName) {
        if (resources.length === 0) return;
        
        console.log(`📁 [SmartPreloader] 开始加载组: ${groupName} (${resources.length}个资源)`);
        
        // 创建所有资源的加载Promise
        const loadPromises = resources.map(resource => 
            this.loadSingleResource(resource)
        );
        
        // 等待所有资源完成（包括超时跳过）
        await Promise.allSettled(loadPromises);
        
        console.log(`📁 [SmartPreloader] 组加载完成: ${groupName}`);
    }
    
    /**
     * 加载单个资源（带超时控制）
     */
    loadSingleResource(resource) {
        return new Promise(async (resolve) => {
            console.log(`⬇️ [SmartPreloader] 尝试加载: ${resource.id}`);
            
            // 设置超时
            const timeoutId = setTimeout(() => {
                console.warn(`⏰ [SmartPreloader] 资源超时跳过: ${resource.id}`);
                
                // 记录失败资源
                this.state.failedResources.push({
                    id: resource.id,
                    url: resource.url,
                    type: resource.type,
                    reason: '超时（超过8秒）'
                });
                
                // 应用备用方案（如果有）
                this.applyFallback(resource);
                
                resolve('timeout');
            }, this.TIMEOUT);
            
            // 存储超时ID便于清理
            this.state.timeoutIds.push(timeoutId);
            
            try {
                // 实际加载资源
                const result = await this.fetchResource(resource);
                
                // 清除超时定时器
                clearTimeout(timeoutId);
                
                if (result.success) {
                    console.log(`✅ [SmartPreloader] 加载成功: ${resource.id}`);
                    this.cache.set(resource.id, result.data);
                } else {
                    console.warn(`⚠️ [SmartPreloader] 加载失败: ${resource.id} - ${result.error}`);
                    
                    // 记录失败资源
                    this.state.failedResources.push({
                        id: resource.id,
                        url: resource.url,
                        type: resource.type,
                        reason: result.error
                    });
                    
                    // 应用备用方案
                    this.applyFallback(resource);
                }
                
                resolve(result.success ? 'success' : 'failed');
                
            } catch (error) {
                // 清除超时定时器
                clearTimeout(timeoutId);
                
                console.error(`❌ [SmartPreloader] 加载异常: ${resource.id}`, error);
                
                // 记录失败资源
                this.state.failedResources.push({
                    id: resource.id,
                    url: resource.url,
                    type: resource.type,
                    reason: error.message || '未知错误'
                });
                
                // 应用备用方案
                this.applyFallback(resource);
                
                resolve('error');
            }
        });
    }
    
    /**
     * 实际获取资源
     */
    async fetchResource(resource) {
        // 特殊处理：如果是字体资源
        if (resource.type === 'font') {
            // 字体使用link预加载
            return this.preloadFont(resource);
        }
        
        // 图片资源使用Image对象
        if (resource.type === 'image') {
            return this.preloadImage(resource);
        }
        
        // 默认使用fetch
        try {
            const controller = new AbortController();
            const signal = controller.signal;
            
            // 设置fetch超时（比总超时少1秒）
            const fetchTimeout = setTimeout(() => controller.abort(), this.TIMEOUT - 1000);
            
            const response = await fetch(resource.url, { 
                signal,
                mode: 'cors',
                cache: 'force-cache' // 强制使用缓存
            });
            
            clearTimeout(fetchTimeout);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            // 根据类型处理响应
            if (resource.type === 'image') {
                const blob = await response.blob();
                return {
                    success: true,
                    data: URL.createObjectURL(blob)
                };
            }
            
            const text = await response.text();
            return {
                success: true,
                data: text
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.name === 'AbortError' ? '请求超时' : error.message
            };
        }
    }
    
    /**
     * 预加载图片
     */
    preloadImage(resource) {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                resolve({
                    success: true,
                    data: img
                });
            };
            
            img.onerror = () => {
                resolve({
                    success: false,
                    error: '图片加载失败'
                });
            };
            
            img.src = resource.url;
            
            // 如果图片有跨域需求
            if (resource.url.includes('raw.githubusercontent.com')) {
                img.crossOrigin = 'anonymous';
            }
        });
    }
    
    /**
     * 预加载字体
     */
    preloadFont(resource) {
        return new Promise((resolve) => {
            // 创建link标签预加载字体
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.href = resource.url;
            link.crossOrigin = 'anonymous';
            
            link.onload = () => {
                resolve({ success: true, data: link });
            };
            
            link.onerror = () => {
                resolve({ 
                    success: false, 
                    error: '字体加载失败' 
                });
            };
            
            document.head.appendChild(link);
            
            // 3秒后无论如何都resolve，字体加载不影响功能
            setTimeout(() => {
                resolve({ success: true, data: null });
            }, 3000);
        });
    }
    
    /**
     * 应用备用方案
     */
    applyFallback(resource) {
        if (!resource.fallback) return;
        
        console.log(`🔄 [SmartPreloader] 为 ${resource.id} 应用备用方案`);
        
        // 如果是图片且有备用base64
        if (resource.type === 'image' && resource.fallback.startsWith('data:')) {
            // 找到页面上使用该图片的元素
            const images = document.querySelectorAll(`img[src*="${resource.url}"], img[src="${resource.url}"]`);
            
            images.forEach(img => {
                if (img.src === resource.url || img.src.includes(resource.url)) {
                    img.src = resource.fallback;
                    img.style.opacity = '0.9';
                    console.log(`🔄 替换图片: ${img.src} -> 备用图片`);
                }
            });
        }
    }
    
    /**
     * 显示失败资源提示框
     */
    showFailureNotification() {
        // 如果已经显示过，不再显示
        if (document.getElementById('preload-failure-notification')) {
            return;
        }
        
        const failedCount = this.state.failedResources.length;
        if (failedCount === 0) return;
        
        console.log(`📢 [SmartPreloader] 显示失败提示，共${failedCount}个资源失败`);
        
        // 创建提示框容器
        const notification = document.createElement('div');
        notification.id = 'preload-failure-notification';
        notification.className = 'preload-notification';
        
        // 创建内容HTML
        notification.innerHTML = `
            <div class="preload-notification-content">
                <div class="preload-notification-header">
                    <span class="material-icons-outlined">warning</span>
                    <h3>资源加载提示</h3>
                </div>
                <div class="preload-notification-body">
                    <p>部分资源加载失败，可能影响使用体验：</p>
                    <ul class="failed-resources-list">
                        ${this.state.failedResources.map(resource => `
                            <li>
                                <span class="resource-type">${this.getTypeIcon(resource.type)}</span>
                                <span class="resource-name">${resource.id}</span>
                                <span class="resource-reason">（${resource.reason}）</span>
                            </li>
                        `).join('')}
                    </ul>
                    <p class="preload-tip">您仍可正常使用网站功能，部分图标可能显示为备用样式。</p>
                </div>
                <div class="preload-notification-footer">
                    <button class="preload-close-btn">
                        <span class="material-icons-outlined">close</span>
                        关闭提示
                    </button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 添加CSS样式（如果不存在）
        this.addNotificationStyles();
        
        // 动画显示
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // 绑定关闭按钮事件
        const closeBtn = notification.querySelector('.preload-close-btn');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // 点击背景关闭
        notification.addEventListener('click', (e) => {
            if (e.target === notification) {
                this.hideNotification(notification);
            }
        });
        
        // 5分钟后自动关闭
        setTimeout(() => {
            if (notification.parentNode) {
                this.hideNotification(notification);
            }
        }, 5 * 60 * 1000);
    }
    
    /**
     * 隐藏提示框
     */
    hideNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    /**
     * 获取资源类型图标
     */
    getTypeIcon(type) {
        const icons = {
            'image': '🖼️',
            'font': '🔤',
            'script': '📜',
            'style': '🎨',
            'default': '📄'
        };
        return icons[type] || icons.default;
    }
    
    /**
     * 添加提示框CSS样式
     */
    addNotificationStyles() {
        if (document.getElementById('preload-notification-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'preload-notification-styles';
        style.textContent = `
            /* 提示框容器 */
            .preload-notification {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
                padding: 20px;
            }
            
            .preload-notification.show {
                opacity: 1;
                visibility: visible;
            }
            
            .preload-notification.hide {
                opacity: 0;
                visibility: hidden;
            }
            
            /* 内容区域 */
            .preload-notification-content {
                background-color: var(--surface-container-lowest);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-4);
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                transform: translateY(20px);
                transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
            }
            
            .preload-notification.show .preload-notification-content {
                transform: translateY(0);
            }
            
            /* 头部 */
            .preload-notification-header {
                display: flex;
                align-items: center;
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--outline-variant);
                gap: var(--spacing-sm);
                background: linear-gradient(135deg, var(--surface-container), var(--surface-container-high));
            }
            
            .preload-notification-header .material-icons-outlined {
                color: var(--secondary);
                font-size: 24px;
            }
            
            .preload-notification-header h3 {
                font-size: 18px;
                font-weight: 600;
                color: var(--on-surface);
                margin: 0;
            }
            
            /* 主体 */
            .preload-notification-body {
                padding: var(--spacing-lg);
            }
            
            .preload-notification-body p {
                color: var(--on-surface-variant);
                margin-bottom: var(--spacing-md);
                line-height: 1.6;
            }
            
            .preload-tip {
                font-size: 14px;
                color: var(--outline);
                font-style: italic;
                margin-top: var(--spacing-md);
            }
            
            /* 失败资源列表 */
            .failed-resources-list {
                list-style: none;
                padding: 0;
                margin: var(--spacing-md) 0;
            }
            
            .failed-resources-list li {
                display: flex;
                align-items: center;
                padding: var(--spacing-sm) 0;
                border-bottom: 1px solid var(--outline-variant);
                gap: var(--spacing-sm);
            }
            
            .failed-resources-list li:last-child {
                border-bottom: none;
            }
            
            .resource-type {
                font-size: 18px;
                width: 30px;
                text-align: center;
            }
            
            .resource-name {
                color: var(--on-surface);
                font-weight: 500;
                flex: 1;
            }
            
            .resource-reason {
                color: var(--secondary);
                font-size: 13px;
                font-weight: 500;
            }
            
            /* 底部按钮 */
            .preload-notification-footer {
                padding: var(--spacing-md) var(--spacing-lg);
                border-top: 1px solid var(--outline-variant);
                text-align: center;
            }
            
            .preload-close-btn {
                background-color: var(--primary);
                color: var(--on-primary);
                border: none;
                padding: var(--spacing-sm) var(--spacing-xl);
                border-radius: var(--radius-full);
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-xs);
                transition: all 0.2s var(--transition-emphasized);
            }
            
            .preload-close-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-2);
            }
            
            .preload-close-btn:active {
                transform: translateY(0);
            }
            
            .preload-close-btn .material-icons-outlined {
                font-size: 18px;
            }
            
            /* 响应式调整 */
            @media (max-width: 600px) {
                .preload-notification {
                    padding: var(--spacing-md);
                }
                
                .preload-notification-content {
                    max-height: 90vh;
                }
                
                .failed-resources-list li {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: var(--spacing-xs);
                }
                
                .resource-reason {
                    align-self: flex-end;
                    margin-left: auto;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 销毁清理
     */
    destroy() {
        // 清理所有超时定时器
        this.state.timeoutIds.forEach(id => clearTimeout(id));
        this.state.timeoutIds = [];
        
        // 清理缓存
        this.cache.clear();
        
        // 移除提示框
        const notification = document.getElementById('preload-failure-notification');
        if (notification) {
            notification.remove();
        }
        
        console.log('🧹 [SmartPreloader] 已销毁清理');
    }
}

// ====== 全局导出 ======
window.YhBBKXPreloader = new SmartPreloader();
