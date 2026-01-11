// ====== YhBBKX 滚动动画管理器 ======
// 版本：1.0.0
// 特点：60fps性能、懒加载、响应式
// 作者：Never155
// 日期：2026年

class ScrollAnimator {
    constructor() {
        // 配置选项
        this.config = {
            threshold: 0.1,      // 10%可见时触发
            rootMargin: '0px',   // 视口边界
            once: true,          // 只动画一次
            delayIncrement: 50,  // 动画延迟增量（ms）
            duration: 600,       // 动画持续时间（ms）
            easing: 'cubic-bezier(0.2, 0, 0, 1)' // 你的MD3E强调曲线
        };
        
        // 动画观察器
        this.observer = null;
        
        // 动画计数器（用于延迟排序）
        this.animationCounters = {
            fade: 0,
            slide: 0,
            scale: 0
        };
        
        // 支持的动画类型
        this.animationTypes = {
            'fade-up': {
                initial: { opacity: 0, transform: 'translateY(30px)' },
                final: { opacity: 1, transform: 'translateY(0)' }
            },
            'fade-down': {
                initial: { opacity: 0, transform: 'translateY(-30px)' },
                final: { opacity: 1, transform: 'translateY(0)' }
            },
            'fade-left': {
                initial: { opacity: 0, transform: 'translateX(30px)' },
                final: { opacity: 1, transform: 'translateX(0)' }
            },
            'fade-right': {
                initial: { opacity: 0, transform: 'translateX(-30px)' },
                final: { opacity: 1, transform: 'translateX(0)' }
            },
            'scale-up': {
                initial: { opacity: 0, transform: 'scale(0.8)' },
                final: { opacity: 1, transform: 'scale(1)' }
            },
            'scale-down': {
                initial: { opacity: 0, transform: 'scale(1.2)' },
                final: { opacity: 1, transform: 'scale(1)' }
            },
            'flip-x': {
                initial: { opacity: 0, transform: 'rotateX(90deg)' },
                final: { opacity: 1, transform: 'rotateX(0deg)' }
            },
            'flip-y': {
                initial: { opacity: 0, transform: 'rotateY(90deg)' },
                final: { opacity: 1, transform: 'rotateY(0deg)' }
            }
        };
        
        // 性能监控
        this.stats = {
            totalElements: 0,
            animatedElements: 0,
            startTime: 0,
            lastScrollTime: 0,
            scrollEvents: 0
        };
        
        console.log('🎬 [ScrollAnimator] 初始化完成');
    }
    
    // ====== 公共API ======
    
    /**
     * 初始化滚动动画系统
     */
    init() {
        if (this.observer) {
            console.warn('⚠️ [ScrollAnimator] 已经初始化过了');
            return;
        }
        
        console.log('🚀 [ScrollAnimator] 启动滚动动画系统...');
        this.stats.startTime = performance.now();
        
        // 创建Intersection Observer
        this.createObserver();
        
        // 设置动画CSS样式
        this.setupAnimationStyles();
        
        // 查找所有需要动画的元素
        this.setupAnimatedElements();
        
        // 设置滚动性能优化
        this.setupScrollOptimization();
        
        // 监听页面切换（你的SPA功能）
        this.setupPageNavigationListener();
        
        console.log(`✅ [ScrollAnimator] 初始化完成，找到 ${this.stats.totalElements} 个动画元素`);
    }
    
    /**
     * 为指定元素添加动画
     * @param {Element} element - DOM元素
     * @param {string} animationType - 动画类型
     * @param {number} customDelay - 自定义延迟（ms）
     */
    animateElement(element, animationType = 'fade-up', customDelay = null) {
        if (!element || !this.animationTypes[animationType]) {
            console.warn('❌ [ScrollAnimator] 无效的元素或动画类型');
            return;
        }
        
        // 添加动画类
        element.classList.add('scroll-animated');
        element.classList.add(`animate-${animationType}`);
        
        // 设置数据属性
        element.dataset.scrollAnimation = animationType;
        
        // 计算延迟（如果是列表中的元素）
        if (customDelay === null && element.parentNode) {
            const siblings = Array.from(element.parentNode.children)
                .filter(el => el.classList.contains('scroll-animated'));
            const index = siblings.indexOf(element);
            customDelay = index * this.config.delayIncrement;
        }
        
        if (customDelay > 0) {
            element.style.setProperty('--animation-delay', `${customDelay}ms`);
        }
        
        // 开始观察这个元素
        if (this.observer) {
            this.observer.observe(element);
        }
        
        this.stats.totalElements++;
    }
    
    /**
     * 为特定选择器的所有元素添加动画
     * @param {string} selector - CSS选择器
     * @param {string} animationType - 动画类型
     * @param {boolean} stagger - 是否错开延迟
     */
    animateSelector(selector, animationType = 'fade-up', stagger = true) {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length === 0) {
            console.log(`🔍 [ScrollAnimator] 没有找到元素: ${selector}`);
            return;
        }
        
        console.log(`🎯 [ScrollAnimator] 为 ${elements.length} 个元素添加 ${animationType} 动画`);
        
        elements.forEach((element, index) => {
            const delay = stagger ? index * this.config.delayIncrement : 0;
            this.animateElement(element, animationType, delay);
        });
    }
    
    /**
     * 重新扫描页面（用于SPA页面切换后）
     */
    refresh() {
        console.log('🔄 [ScrollAnimator] 重新扫描动画元素');
        
        // 断开旧观察器
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // 重置计数器
        this.stats.totalElements = 0;
        this.stats.animatedElements = 0;
        this.animationCounters = { fade: 0, slide: 0, scale: 0 };
        
        // 重新初始化
        this.createObserver();
        this.setupAnimatedElements();
    }
    
    /**
     * 获取性能统计
     */
    getStats() {
        return {
            ...this.stats,
            runtime: performance.now() - this.stats.startTime,
            animationRatio: this.stats.totalElements > 0 
                ? (this.stats.animatedElements / this.stats.totalElements * 100).toFixed(1) + '%'
                : '0%'
        };
    }
    
    // ====== 私有方法 ======
    
    /**
     * 创建Intersection Observer
     */
    createObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.handleElementInView(entry.target);
                    }
                });
            },
            {
                threshold: this.config.threshold,
                rootMargin: this.config.rootMargin
            }
        );
        
        console.log('👀 [ScrollAnimator] 创建观察器完成');
    }
    
    /**
     * 设置动画CSS样式
     */
    setupAnimationStyles() {
        // 检查是否已经添加过样式
        if (document.getElementById('scroll-animation-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'scroll-animation-styles';
        
        // 使用你的MD3E设计变量
        style.textContent = `
            /* ====== 滚动动画基础样式 ====== */
            .scroll-animated {
                opacity: 0;
                transition: none;
                will-change: opacity, transform;
            }
            
            .scroll-animated.animated {
                opacity: 1;
                transition: all var(--animation-duration, 600ms) var(--animation-easing, cubic-bezier(0.2, 0, 0, 1));
                transition-delay: var(--animation-delay, 0ms);
            }
            
            /* ====== 动画类型定义 ====== */
            
            /* 淡入向上 */
            .animate-fade-up {
                transform: translateY(30px);
            }
            .animate-fade-up.animated {
                transform: translateY(0);
            }
            
            /* 淡入向下 */
            .animate-fade-down {
                transform: translateY(-30px);
            }
            .animate-fade-down.animated {
                transform: translateY(0);
            }
            
            /* 淡入向左 */
            .animate-fade-left {
                transform: translateX(30px);
            }
            .animate-fade-left.animated {
                transform: translateX(0);
            }
            
            /* 淡入向右 */
            .animate-fade-right {
                transform: translateX(-30px);
            }
            .animate-fade-right.animated {
                transform: translateX(0);
            }
            
            /* 缩放向上 */
            .animate-scale-up {
                transform: scale(0.8);
            }
            .animate-scale-up.animated {
                transform: scale(1);
            }
            
            /* 缩放向下 */
            .animate-scale-down {
                transform: scale(1.2);
            }
            .animate-scale-down.animated {
                transform: scale(1);
            }
            
            /* 翻转X轴 */
            .animate-flip-x {
                transform: rotateX(90deg);
                transform-origin: top;
            }
            .animate-flip-x.animated {
                transform: rotateX(0deg);
            }
            
            /* 翻转Y轴 */
            .animate-flip-y {
                transform: rotateY(90deg);
                transform-origin: left;
            }
            .animate-flip-y.animated {
                transform: rotateY(0deg);
            }
            
            /* ====== 页面特定动画 ====== */
            
            /* 首页 - 英雄区域延迟动画 */
            .hero-logo {
                --animation-delay: 200ms;
            }
            
            .hero-title {
                --animation-delay: 400ms;
            }
            
            .hero-subtitle {
                --animation-delay: 600ms;
            }
            
            .hero-desc {
                --animation-delay: 800ms;
            }
            
            .btn-group {
                --animation-delay: 1000ms;
            }
            
            /* 功能卡片 - 交错动画 */
            .feature-card:nth-child(1) {
                --animation-delay: 200ms;
            }
            
            .feature-card:nth-child(2) {
                --animation-delay: 400ms;
            }
            
            .feature-card:nth-child(3) {
                --animation-delay: 600ms;
            }
            
            .feature-card:nth-child(4) {
                --animation-delay: 800ms;
            }
            
            /* 内容页面 */
            .content-title {
                --animation-delay: 200ms;
            }
            
            .content-body {
                --animation-delay: 400ms;
            }
            
            /* ====== 响应式调整 ====== */
            @media (max-width: 600px) {
                .scroll-animated {
                    --animation-duration: 400ms;
                }
                
                .animate-fade-up,
                .animate-fade-down {
                    transform: translateY(20px);
                }
                
                .animate-fade-left,
                .animate-fade-right {
                    transform: translateX(20px);
                }
            }
            
            /* ====== 减少运动偏好 ====== */
            @media (prefers-reduced-motion: reduce) {
                .scroll-animated {
                    opacity: 1;
                    transform: none !important;
                    transition: none !important;
                }
                
                .scroll-animated.animated {
                    transition: none !important;
                }
            }
            
            /* ====== 性能优化 ====== */
            .scroll-animated {
                backface-visibility: hidden;
                -webkit-font-smoothing: antialiased;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 [ScrollAnimator] 动画样式已添加');
    }
    
    /**
     * 设置需要动画的元素
     */
    setupAnimatedElements() {
        // 默认配置：自动为以下元素添加动画
        const autoAnimateSelectors = [
            // 首页元素
            { selector: '.hero-logo', type: 'scale-up' },
            { selector: '.hero-title', type: 'fade-up' },
            { selector: '.hero-subtitle', type: 'fade-up' },
            { selector: '.hero-desc', type: 'fade-up' },
            { selector: '.btn-group', type: 'fade-up' },
            
            // 功能卡片
            { selector: '.feature-card', type: 'fade-up' },
            
            // 内容页面
            { selector: '.content-title', type: 'fade-up' },
            { selector: '.content-body', type: 'fade-up' },
            
            // 页脚（可选）
            { selector: '.footer', type: 'fade-up' }
        ];
        
        // 应用自动动画
        autoAnimateSelectors.forEach(config => {
            this.animateSelector(config.selector, config.type, true);
        });
        
        // 手动添加特定动画（示例）
        // this.animateSelector('.card-icon', 'scale-up', true);
        // this.animateSelector('.nav-item', 'fade-right', true);
    }
    
    /**
     * 处理元素进入视口
     */
    handleElementInView(element) {
        if (element.classList.contains('animated')) {
            return; // 已经动画过了
        }
        
        // 添加动画类
        element.classList.add('animated');
        
        // 更新统计
        this.stats.animatedElements++;
        
        // 动画完成后清理
        const duration = this.config.duration + 
            parseInt(element.style.getPropertyValue('--animation-delay') || 0);
        
        setTimeout(() => {
            element.style.willChange = 'auto';
        }, duration);
        
        // 如果配置了只动画一次，就停止观察
        if (this.config.once) {
            this.observer.unobserve(element);
        }
        
        console.log(`✨ [ScrollAnimator] 元素动画触发: ${element.className}`);
    }
    
    /**
     * 设置滚动性能优化
     */
    setupScrollOptimization() {
        // 使用requestAnimationFrame节流滚动事件
        let ticking = false;
        
        const optimizeScroll = () => {
            this.stats.scrollEvents++;
            this.stats.lastScrollTime = performance.now();
            
            // 这里可以添加滚动时的特殊效果
            // 例如：视差、进度指示器等
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(optimizeScroll);
                ticking = true;
            }
        }, { passive: true }); // 提升滚动性能
        
        console.log('⚡ [ScrollAnimator] 滚动性能优化已启用');
    }
    
    /**
     * 设置页面导航监听（适配你的SPA）
     */
    setupPageNavigationListener() {
        // 监听你的页面切换事件
        window.addEventListener('pageLoaded', () => {
            console.log('📄 [ScrollAnimator] 检测到页面切换，刷新动画');
            setTimeout(() => {
                this.refresh();
            }, 300); // 等待页面渲染完成
        });
        
        // 监听路由变化（如果你将来添加路由）
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.refresh(), 100);
        });
    }
    
    /**
     * 销毁清理
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // 移除样式
        const styles = document.getElementById('scroll-animation-styles');
        if (styles) {
            styles.remove();
        }
        
        console.log('🧹 [ScrollAnimator] 已销毁清理');
    }
}

// ====== 全局导出 ======
window.YhBBKXScrollAnimator = new ScrollAnimator();
