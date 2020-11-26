// zh_tcwq/pubcoms/navbar/navbar.js
import tabbarList from "../../config/router.js"
const app = getApp();
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        url: {
            type: String,
            default: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        show: true
    },

    /**
     * 组件的方法列表
     */
    methods: {
        hidePage() {
        this.setData({
            show:false
        })
        }
    },
    ready() { },
})