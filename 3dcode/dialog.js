/**
  * author zouxuan 2022-03-20
  * desc 弹出框定义
  *弹框信息类型：msgtype:'success','error','info','warn' 标题：title  内容：content   回调函数可不传
  *alert确认按钮回调函数：callback
  *$.alert({msgtype:'error',title:'提示',content:"加载数据失败加载数据失败加载数据失败!",confirmText:'确定'},callback);
  *toast消失间隔时长 time 单位毫秒   取消时回调函数  callback
  *$.toast({msgtype:'error',content:'不是此设备不是此设备不是此设备!',time:400},callback);
  *confirm提示框回调函数 确认:comfirm  取消:cancel 
  *$.confirm({msgtype:'error',title:'提示',content:"加载数据失败!",confirmText:'确定',cancelText:'取消'},, confirm, cancel);
  */
  (function ($) {
    jQuery.extend({
        open: function(type, option) {
            var content = option?option:'',msgtype='info', title = '', confirmText = '确定',cancelText = '取消', closeText = '';
            if (typeof(option) == 'object') {
                msgtype = option.msgtype? option.msgtype: msgtype;
                title = option.title? option.title: title;
                content = option.content? option.content: content;
                confirmText = option.confirmText? option.confirmText: confirmText;
                cancelText = option.cancelText? option.cancelText: cancelText;
                closeText = option.closeText? option.closeText: closeText;
            }
            var html = "";
            html += '<div class="eq-dialog-modal-mask" id="eq-dialog-mask-'+type+'"></div>';
            html += '<div class="eq-dialog-modal eq-dialog-modal-'+type+'" id="eq-dialog-'+type+'">';
            switch (type) {
                case 'alert':
                    html += '<div class="eq-dialog-modal-title eq-dialog-modal-title-'+msgtype+'">'+title+'</div>';
                    html += '<div class="eq-dialog-modal-content eq-dialog-modal-content-'+msgtype+'">';
                    html += '<div class="eq-dialog-modal-text eq-hidden-scroll">'+content+'</div></div>';
                    html += '<div class="eq-dialog-modal-btn">';
                    html += '<button type="button" class="eq-dialog-modal-btn-'+msgtype+'">'+confirmText+'</button>';
                    break;
                case 'confirm':
                    html += '<div class="eq-dialog-modal-title eq-dialog-modal-title-'+msgtype+'">'+title+'</div>';
                    html += '<div class="eq-dialog-modal-content eq-dialog-modal-content-'+msgtype+'">';
                    html += '<div class="eq-dialog-modal-text eq-hidden-scroll">'+content+'</div></div>';
                    html += '<div class="eq-dialog-modal-btn">';
                    html += '<button type="button" class="confirm eq-dialog-modal-btn-'+msgtype+'">'+confirmText+'</button>';
                    html += '<button type="button" class="cancel eq-dialog-modal-btn-'+msgtype+'">'+cancelText+'</button>';
                    if(closeText){
                        html += '<button type="button" class="close eq-dialog-modal-btn-'+msgtype+'">'+closeText+'</button>';
                    }
                    break;
                case 'toast':
                    html += '<div class="eq-dialog-modal-content eq-dialog-modal-content-'+msgtype+'"><div class="eq-dialog-modal-text eq-hidden-scroll">'+content+'</div>';
                    break;
                // myf 20250328 添加dialog类型
                case 'dialog':
                    html += '<div class="eq-dialog-modal-title eq-dialog-modal-title-info">';
                    html += title;
                    html += '<span class="dialog-close-btn" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);cursor:pointer;">×</span>';
                    html += '</div>';
                    html += '<div class="eq-hidden-scroll" style="min-height:8.6rem;background: linear-gradient( 90deg, rgba(28,71,135,0.75) 0%, rgba(1,43,106,0.9) 100%);color: #fff;">'+content+'</div>';
                    break;
            }
            $("body").addClass('eq-overflow').append(html);
            window.addEventListener("mousewheel", this.forbidScroll);
            window.addEventListener("touchmove", this.forbidScroll,{passive:false});
            var obj = $("#eq-dialog-"+type);
            $("#eq-dialog-mask-"+type).fadeIn(300);
            obj.addClass("eq-dialog-ani-open");
            var screenHeight = window.screen.height;
            var innerHeight = window.innerHeight;
            var height = obj.height();
            obj.css("margin-top", "-" + Math.ceil((screenHeight-innerHeight+height)/2) + 'px');
            obj.show();
        },
        alert: function(option, callback) {
            this.open('alert', option);
            let that = this;
            $('.eq-dialog-modal-btn button').click(function(){
                that.close("alert");
                if(typeof(callback) != 'undefined') {
                    callback();
                }
            })
        },
        confirm: function(option, confirm, cancel, close) {
           this.open('confirm', option);
           let that = this;
           $('.eq-dialog-modal-btn button').click(function(){
               that.close("confirm");
            //    if($(this).attr('class') === 'confirm eq-dialog-modal-btn-info') {  //modify by jyp 2023-11-15 css class名称调用调整导致判断错误，更新了判断的名称
               if($(this).attr('class').includes('confirm')) {  //modify by myf 2023-12-12 判断错误
                   if(typeof(confirm) != 'undefined') {confirm();}
            //    } else if($(this).attr('class') === 'cancel eq-dialog-modal-btn-info') {   //modify by jyp 2023-11-15 css class名称调用调整导致判断错误，更新了判断的名称
               } else if($(this).attr('class').includes('cancel')) {   //modify by myf 2023-12-12 判断错误
                   if(typeof(cancel) != 'undefined') {cancel();}
               } else {
                   if(typeof(close) != 'undefined') {close();}
               }
           })
        },
        toast: function(option, callback) {
            this.open('toast', option);
            var time = option.time? option.time: 3000;
            setTimeout(()=>{
                this.close('toast');
                if(typeof(callback) != 'undefined') {
                    callback();
                }
            },time)
        },
        // myf 20250328 添加dialog类型
        dialog: function(option) {
            this.open('dialog', option);
            let that = this;
            if(option.onShow) {
                option.onShow();
            }
            // 改为只监听关闭按钮的点击事件
            $('.dialog-close-btn').click(function() {
                that.close("dialog");
                if(option.onClose) {
                    option.onClose();
                }
            });
        },
        close: function(type) {
            window.removeEventListener("mousewheel",this.forbidScroll);
            window.removeEventListener("touchmove",this.forbidScroll,{passive:false});
            $("body").removeClass('eq-overflow');
            var obj = $("#eq-dialog-" + type);
            $("#eq-dialog-mask-" + type).fadeOut(200);
            obj.addClass("eq-dialog-ani-close");
            setTimeout(() => {
                obj.hide();
                obj.removeClass("eq-dialog-ani-close");
                $("#eq-dialog-mask-" + type).remove();
                $("#eq-dialog-" + type).remove();
                obj.remove();
            }, 300)
        }
    })
})(jQuery);