// ====== YhBBKX 滚动动画管理器 ======
// 版本：2.0.0 - 完全适配YhBBKX网站
// 特点：适配SPA页面切换、MD3E动画曲线、智能元素检测
// 作者：Never155
// 日期：2026年

class YhBBKXScrollAnimator {
    constructor() {
        // 配置 - 适配MD3E设计
        this.config = {
            threshold: 0.08,
            rootMargin: '50px',
            once: true,
            delayIncrement: 80,
            duration: 800,
            easing: 'cubic-bezier(0.2, 0, 0, 1)' // MD3E强调曲线
        };
        
        this.observer = null;
        this.isInitialized = false;
        this.currentPage = 'homePage';
        
        console.log('🎬 [ScrollAnimator] 已加载 - 适配YhBBKX网站');
    }
    
    // ====== 主入口 ======
    init() {
        if (this.isInitialized) {
            console.log('🔁 [ScrollAnimator] 重新初始化');
            this.refresh();
            return;
        }
        
        console.log('🚀 [ScrollAnimator] 启动...');
        
        try {
            // 1. 添加CSS样式
            this.addAnimationStyles();
            
            // 2. 创建观察器
            this.createObserver();
            
            // 3. 标记已初始化
            this.isInitialized = true;
            
            // 4. 首次扫描
            setTimeout(() => {
                this.scanCurrentPage();
            }, 500);
            
            // 5. 监听页面切换
            this.setupPageListeners();
            
        } catch (error) {
            console.error('❌ [ScrollAnimator] 初始化失败:', error);
        }
    }
    
    addAnimationStyles() {
        if (document.getElementById('yhbbkx-anim-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'yhbbkx-anim-styles';
        
        style.textContent = `
            /* ====== YhBBKX滚动动画系统 - MD3E风格 ====== */
            
            /* 基础动画类 */
            .yh-animated {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.8s cubic-bezier(0.2, 0, 0, 1),
                          transform 0.8s cubic-bezier(0.2, 0, 0, 1);
                will-change: opacity, transform;
            }
            
            /* 激活状态 */
            .yh-animated.yh-animated-active {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* 延迟动画 - 首页元素 */
            .hero-logo.yh-animated {
                transform: translateY(30px) scale(0.9);
                transition-delay: 0.1s;
            }
            
            .hero-title.yh-animated {
                transform: translateY(30px);
                transition-delay: 0.2s;
            }
            
            .hero-subtitle.yh-animated {
                transform: translateY(30px);
                transition-delay: 0.3s;
            }
            
            .hero-desc.yh-animated {
                transform: translateY(30px);
                transition-delay: 0.4s;
            }
            
            .btn-group.yh-animated {
                transform: translateY(30px);
                transition-delay: 0.5s;
            }
            
            /* 功能卡片 - 交错动画 */
            .feature-card.yh-animated {
                transform: translateY(30px);
            }
            
            .feature-card:nth-child(1).yh-animated {
                transition-delay: 0.2s;
            }
            
            .feature-card:nth-child(2).yh-animated {
                transition-delay: 0.3s;
            }
            
            .feature-card:nth-child(3).yh-animated {
                transition-delay: 0.4s;
            }
            
            .feature-card:nth-child(4).yh-animated {
                transition-delay: 0.5s;
            }
            
            /* 内容页面动画 */
            .content-title.yh-animated {
                transform: translateY(30px);
                transition-delay: 0.1s;
            }
            
            .content-body.yh-animated {
                transform: translateY(30px);
                transition-delay: 0.2s;
            }
            
            /* 页脚动画 */
            .footer.yh-animated {
                transform: translateY(30px);
                transition-delay: 0.1s;
            }
            
            /* 移动端调整 */
            @media (max-width: 600px) {
                .yh-animated {
                    transform: translateY(15px);
                    transition-duration: 0.6s;
                }
            }
            
            /* 减少运动偏好 */
            @media (prefers-reduced-motion: reduce) {
                .yh-animated {
                    opacity: 1 !important;
                    transform: none !important;
                    transition: none !important;
                }
            }
            
            /* 性能优化 */
            .yh-animated {
                backface-visibility: hidden;
                -webkit-font-smoothing: antialiased;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 [ScrollAnimator] 动画样式已添加');
    }
    
    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activateElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.config.threshold,
            rootMargin: this.config.rootMargin
        });
        
        console.log('👀 [ScrollAnimator] 观察器创建成功');
    }
    
    // ====== 页面扫描逻辑 ======
    
    scanCurrentPage() {
        const activePage = document.querySelector('.page-container.active');
        if (!activePage) {
            console.log('🔍 [ScrollAnimator] 没有找到活动页面');
            return;
        }
        
        this.currentPage = activePage.id;
        console.log(`📄 [ScrollAnimator] 扫描页面: ${this.currentPage}`);
        
        // 清空之前的观察
        if (this.observer) {
            this.observer.disconnect();
            this.createObserver();
        }
        
        // 根据页面类型设置不同的动画元素
        if (this.currentPage === 'homePage') {
            this.setupHomePageAnimations();
        } else {
            this.setupContentPageAnimations();
        }
    }
    
    setupHomePageAnimations() {
        console.log('🏠 [ScrollAnimator] 设置首页动画');
        
        // 首页特定元素
        const homeElements = [
            // Hero区域
            { selector: '.hero-logo', delay: 0 },
            { selector: '.hero-title', delay: 100 },
            { selector: '.hero-subtitle', delay: 200 },
            { selector: '.hero-desc', delay: 300 },
            { selector: '.btn-group', delay: 400 },
            
            // 功能卡片
            { selector: '.feature-card:nth-child(1)', delay: 100 },
            { selector: '.feature-card:nth-child(2)', delay: 200 },
            { selector: '.feature-card:nth-child(3)', delay: 300 },
            { selector: '.feature-card:nth-child(4)', delay: 400 },
            
            // 页脚
            { selector: '.footer', delay: 100 }
        ];
        
        this.addElementsWithDelay(homeElements);
    }
    
    setupContentPageAnimations() {
        console.log('📝 [ScrollAnimator] 设置内容页面动画');
        
        // 内容页面通用元素
        const contentElements = [
            { selector: '.content-title', delay: 100 },
            { selector: '.content-body', delay: 200 },
            { selector: '.footer', delay: 100 }
        ];
        
        this.addElementsWithDelay(contentElements);
    }
    
    addElementsWithDelay(elements) {
        elements.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element) {
                // 移除之前的动画类
                element.classList.remove('yh-animated', 'yh-animated-active');
                
                // 强制重排
                void element.offsetWidth;
                
                // 添加动画类
                element.classList.add('yh-animated');
                element.style.transitionDelay = `${item.delay}ms`;
                
                // 开始观察
                this.observer.observe(element);
            }
        });
    }
    
    activateElement(element) {
        if (!element || element.classList.contains('yh-animated-active')) {
            return;
        }
        
        element.classList.add('yh-animated-active');
        console.log(`✨ [ScrollAnimator] 动画激活: ${element.className.split(' ')[0]}`);
        
        // 动画完成后清理
        setTimeout(() => {
            element.style.willChange = 'auto';
        }, this.config.duration + parseInt(element.style.transitionDelay || 0));
    }
    
    // ====== 页面切换监听 ======
    
    setupPageListeners() {
        // 监听你的SPA页面切换事件
        window.addEventListener('pageLoaded', () => {
            console.log('🔄 [ScrollAnimator] 检测到页面切换');
            setTimeout(() => {
                this.scanCurrentPage();
            }, 350); // 等待页面切换动画完成
        });
        
        // DOM变化监听（备用方案）
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    mutation.target.classList.contains('page-container') &&
                    mutation.target.classList.contains('active')) {
                    
                    console.log('🔍 [ScrollAnimator] DOM变化检测到页面切换');
                    setTimeout(() => {
                        this.scanCurrentPage();
                    }, 300);
                }
            });
        });
        
        // 监听所有页面容器的变化
        document.querySelectorAll('.page-container').forEach(container => {
            observer.observe(container, { attributes: true });
        });
    }
    
    // ====== 公共API ======
    
    refresh() {
        console.log('🔄 [ScrollAnimator] 刷新动画系统');
        
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // 移除所有动画类
        document.querySelectorAll('.yh-animated, .yh-animated-active').forEach(el => {
            el.classList.remove('yh-animated', 'yh-animated-active');
            el.style.transitionDelay = '';
            el.style.willChange = '';
        });
        
        // 重置观察器
        this.createObserver();
        
        // 重新扫描
        setTimeout(() => {
            this.scanCurrentPage();
        }, 100);
    }
    
    forceAnimatePage() {
        console.log('⚡ [ScrollAnimator] 强制触发页面动画');
        this.scanCurrentPage();
        
        // 强制触发所有可见元素的动画
        setTimeout(() => {
            document.querySelectorAll('.yh-animated').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.9) {
                    this.activateElement(el);
                }
            });
        }, 200);
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        const styleEl = document.getElementById('yhbbkx-anim-styles');
        if (styleEl) {
            styleEl.remove();
        }
        
        this.isInitialized = false;
        console.log('🧹 [ScrollAnimator] 已销毁');
    }
}

// ====== 全局初始化 ======
window.YhBBKXScrollAnimator = new YhBBKXScrollAnimator();

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 [ScrollAnimator] DOM加载完成，准备初始化...');
        setTimeout(() => {
            window.YhBBKXScrollAnimator.init();
        }, 100);
    });
} else {
    console.log('📄 [ScrollAnimator] DOM已加载，立即初始化...');
    setTimeout(() => {
        window.YhBBKXScrollAnimator.init();
    }, 100);
}

// 错误恢复
window.addEventListener('error', (e) => {
    if (e.message.includes('IntersectionObserver')) {
        console.warn('⚠️ [ScrollAnimator] 观察器错误，启用回退');
        // 直接显示所有内容
        document.querySelectorAll('.yh-animated').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
});

console.log('✅ [ScrollAnimator] YhBBKX滚动动画系统就绪');