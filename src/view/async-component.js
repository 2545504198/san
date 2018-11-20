/**
 * @file 异步组件类
 * @author errorrik(errorrik@gmail.com)
 */

var NodeType = require('./node-type');
var nodeOwnCreateStump = require('./node-own-create-stump');
var nodeOwnSimpleDispose = require('./node-own-simple-dispose');


/**
 * 异步组件类
 *
 * @class
 * @param {Object} options 初始化参数
 * @param {Object} loader 组件加载器
 */
function AsyncComponent(options, loader) {
    this.options = options;
    this.loader = loader;
    this.id = guid();
    this.children = [];

    // #[begin] reverse
    var reverseWalker = options.reverseWalker;
    if (reverseWalker) {
        var LoadingComponent = this.loader.placeholder.loading;
        if (LoadingComponent) {
            this.children[0] = new LoadingComponent(options);
        }

        this._create();
        insertBefore(this.el, reverseWalker.target, reverseWalker.current);

        var me = this;
        this.loader.listen(function (ComponentClass) {
            me.onload(ComponentClass);
        });
        this.loader.start();
    }
    options.reverseWalker = null;
    // #[end]
}

AsyncComponent.prototype._create = nodeOwnCreateStump;
AsyncComponent.prototype.dispose = nodeOwnSimpleDispose;

/**
 * attach到页面
 *
 * @param {HTMLElement} parentEl 要添加到的父元素
 * @param {HTMLElement＝} beforeEl 要添加到哪个元素之前
 */
AsyncComponent.prototype.attach = function (parentEl, beforeEl) {
    var LoadingComponent = this.loader.placeholder.loading;
    if (LoadingComponent) {
        var component = new LoadingComponent(this.options);
        this.children[0] = component;
        component.attach(parentEl, beforeEl);
    }

    this._create();
    insertBefore(this.el, parentEl, beforeEl);

    var me = this;
    this.loader.listen(function (ComponentClass) {
        me.onload(ComponentClass);
    });
    this.loader.start();
};

/**
 * loader加载完成，渲染组件
 *
 * @param {Function=} ComponentClass 组件类
 */
AsyncComponent.prototype.onload = function (ComponentClass) {
    if (this.el && ComponentClass) {
        var component = new ComponentClass(this.options);
        component.attach(this.el.parentNode, this.el);

        var parentChildren = this.options.parent.children;
        var len = parentChildren.length;

        while (len--) {
            if (parentChildren[len] === this) {
                parentChildren[len] = component;
                break;
            }
        }
    }

    this.dispose();
};

exports = module.exports = AsyncComponent;
