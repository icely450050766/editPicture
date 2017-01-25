/**
 * Created by Administrator on 2017/1/18.
 */
var editPicture = ( function($){
    return{

        $canvasParent: null, // canvas 父元素 jq对象
        $canvasClipBox: null, // 裁剪 box
        $canvasTextAreaBox: null, // 添加文字 的textarea

        canvas: null, // canvas dom元素
        canvasContext: null, // 图形上下文

        lineColor: "#000000", // 绘制 线条颜色
        lineWidth: 3, // 绘制 线条粗细

        init: function( $canvasParent ){

            // 设置 父容器样式
            this.$canvasParent = $canvasParent;
            this.$canvasParent.css( 'position', 'relative' );

            //this.initCanvasAndDrawPicture( $('.testPicture')[0] );  // 初始化 canvas，绘制图片

            this.initCanvasClipBox();// 初始化 canvas里面，裁剪 box
            this.initCanvasTextAreaBox();// 初始化 canvas里面，添加文字 的textarea
            this.addBtnEvent(); // 按钮 事件监听

            // 初始化 裁剪 box
            this.$canvasClipBox.hide();// 隐藏

            // 初始化 添加文字 的textarea 样式
            this.$canvasTextAreaBox.hide();// 隐藏
            this.$canvasTextAreaBox.find('.fontSizeConfig').trigger('change');
            this.$canvasTextAreaBox.find('.colorConfig').trigger('change');
        },


        // 初始化 canvas里面，裁剪 box
        initCanvasClipBox: function(){

            var _content = '<div class="canvasClipBox">' + 
                                '<button class="clipBoxMoveBtn">拖动</button>' +
                                '<button class="clipFinishBtn">确认</button></div>';

            this.$canvasClipBox = $(_content);
            this.$canvasParent.append( this.$canvasClipBox );
        },

        // 初始化 canvas里 添加文字 的textareaBox
        initCanvasTextAreaBox: function(){

            var _content = '<div class="canvasTextAreaBox">' +
                                '<div class="canvasTextConfigBox">' +
                                    '<select class="fontSizeConfig">' + returnOptions( 15, 30 ) + '</select>' +
                                    '<input class="colorConfig" type="color">' +
                                    '<input class="textAreaEditFinishBtn" type="button" value="编辑完成">' +
                                    '<input class="closeBtn" type="button" value="&times;">' +
                                '</div>' +
                                '<textarea class="canvasTextArea" placeholder="点击输入文字"></textarea>' +
                            '</div>';

            this.$canvasTextAreaBox = $(_content);
            this.$canvasParent.append( this.$canvasTextAreaBox );

            //（辅助函数）返回 下拉列表项的字符串（参数：开始、结束的数字）
            function returnOptions( startNum, endNum ){

                startNum = parseInt( startNum );
                endNum = parseInt( endNum );

                var _options = '';
                for( var i=startNum; i <= endNum; i++ ){
                    _options += '<option value="' + i + '">' + i + '</option>';
                }
                return _options;
            }
        },

        // 初始化 canvas，绘制图片（参数：要绘制的 img dom对象）
        initCanvasAndDrawPicture: function( img ){

            if( this.canvas )  $(this.canvas).remove();// 移除原有 canvas

            var w = Math.min( 900, img.width );// 当图片宽度超过 400px 时, 就压缩成 400px, 高度按比例计算
            // var w = img.width;
            var h = img.height * (w / img.width);
            var max = ( w > h ? w : h );

            this.canvas = document.createElement('canvas');
            this.canvas.width = w; // 设置 canvas 的宽度和高度
            this.canvas.height = h;

            this.canvasContext = this.canvas.getContext('2d');// 图形上下文
            //this.canvasContext.translate( w/2, h/2);
            this.canvasContext.drawImage(img, 0, 0, w, h);// 把图片绘制到 canvas 中

            // 设置容器宽度、高度
            this.$canvasParent.css({
                'width': max + 'px',
                'height': max + 'px',
                'text-align': 'center',
            });
            this.$canvasParent.append( this.canvas ); // canvas 插入页面
        },


        // 自由绘制
        drawDiy: function( oldX, oldY, newX, newY ){

            this.canvasContext.beginPath();
            this.canvasContext.strokeStyle = this.lineColor;// 边框样式（颜色）
            this.canvasContext.lineWidth = this.lineWidth;
            this.canvasContext.lineCap = "round";// 线帽

            this.canvasContext.moveTo( oldX, oldY );
            this.canvasContext.lineTo( newX, newY );
            this.canvasContext.stroke();// 绘制边框
            this.canvasContext.closePath();
        },

        // 绘制圆形
        drawCircle: function( startX, startY, endX, endY ){

            var _diameter = Math.sqrt( ( endX - startX ) * ( endX - startX ) + ( endY - startY ) * ( endY - startY ) ) ;
            var _radius = _diameter / 2; // 半径
            var _circleX = ( endX + startX ) / 2;// 圆心 x坐标
            var _circleY = ( endY + startY ) / 2;// 圆心 y坐标

            this.canvasContext.beginPath();
            this.canvasContext.strokeStyle = this.lineColor;// 边框样式（颜色）
            this.canvasContext.lineWidth = this.lineWidth;

            this.canvasContext.arc( _circleX, _circleY, _radius, 0, Math.PI * 2, true );
            this.canvasContext.stroke();// 绘制边框
            this.canvasContext.closePath();
        },

        // 绘制文字
        drawText: function( text, fontSize, color, posX, posY ){

            this.canvasContext.beginPath();
            this.canvasContext.fillStyle = color;// 颜色
            this.canvasContext.font = 'normal ' + fontSize + 'px normal';

            this.canvasContext.fillText( text, posX, posY );
            this.canvasContext.closePath();
        },


        // 根据当前canvas的 dataUrl，重新绘画canvas（参数：画图的函数，canvas宽、高(绘制图片的宽。高)、绘制图片的起始位置。参数可选，一般 只在旋转、裁剪 的时候传参）
        drawCanvasByDataUrl: function( drawImgFunc, w, h, startX, startY ){

            var _self = this;
            var image = new Image();
            image.onload = function() {

                // 宽、高，不传则默认为 原始图片宽度
                w = ( w == undefined ? image.width : w );
                h = ( h == undefined ? image.height : h );

                // 绘制图片的起始位置（裁剪时传参）
                startX = ( startX == undefined ? 0 : startX );
                startY = ( startY == undefined ? 0 : startY );

                // 设置 canvas宽、高
                _self.canvas.width = w;
                _self.canvas.height = h;

                // 执行画图函数，如果不传，默认为绘画当前 canvas图片
                if( drawImgFunc ) drawImgFunc( image );
                else _self.canvasContext.drawImage(image, startX, startY, w, h, 0, 0, w, h );
            };
            image.src = _self.canvas.toDataURL('image/png');
        },

        // 旋转 canvas
        rotateCanvas: function( isLeft ){

            var _self = this;
            var w = this.canvas.width;
            var h = this.canvas.height;

            // 旋转 宽高互换
            this.drawCanvasByDataUrl( function( image ){

                // 旋转画布
                if( isLeft ){
                    _self.canvasContext.rotate( -90 * Math.PI / 180 );
                    _self.canvasContext.drawImage( image, -w, 0 );
                }else{
                    _self.canvasContext.rotate( 90 * Math.PI / 180 );
                    _self.canvasContext.drawImage( image, 0, -h );
                }

                // 旋转画布后，二次绘画canvas，使得 不影响涂鸦功能
                _self.drawCanvasByDataUrl();

            }, h, w );

        },

        // 裁剪
        clipPicture: function( startX, startY, endX, endY ){
            //this.canvasContext.save();// 保存

            var _width = endX - startX;
            var _height = endY - startY;

            // 裁切整个画布
            this.canvasContext.beginPath();
            this.canvasContext.rect( startX, startY, _width, _height );
            // this.canvasContext.stroke(); // 描绘边框
            this.canvasContext.clip(); // 裁剪

            // 根据当前canvas的 dataUrl，重新绘画canvas
            this.drawCanvasByDataUrl( undefined, _width, _height, startX, startY ); 
            this.canvasContext.closePath();
        },



        // 获取 元素的位置、宽度（参数：元素的jq对象）
        getItemPosAndSize: function( $item ){

            var obj = {};

            obj.left = parseInt( $item.position().left );
            obj.top = parseInt( $item.position().top );

            obj.width = parseInt( $item.css('width') );
            obj.height = parseInt( $item.css('height') );

            return obj;
        },


        // （通用）增加 拖动事件（ $item可选，有值则为传入的 元素 增加拖动事件，默认$item 是 canvas）
        addDragEvent: function( mousedownFunc, mousemoveFunc, mouseupFunc, $item ){

            $item = ( $item == undefined  ?  $( this.canvas ) : $item );
            $item.off();// 取消所有事件监听

            // 位置坐标
            var _startX, _startY, _endX, _endY;// 起始点、终止点
            var _oldX, _oldY, _newX, _newY;// move事件：上一个点、当前点

            // 拖动事件：（只监听 鼠标 按下事件）
            $item.on('mousedown', function(e){
                //console.log('按下');

                _startX = e.offsetX;
                _startY = e.offsetY;
                _oldX  = e.offsetX;
                _oldY = e.offsetY;

                //console.log( _startX );
                //console.log( _startY);

                if( mousedownFunc ) mousedownFunc( e, _startX, _startY );

                // 鼠标 移动事件
                $(this).on('mousemove', function(e){
                    //console.log('移动');

                    _newX = e.offsetX;
                    _newY = e.offsetY;
                    if( mousemoveFunc ) mousemoveFunc( e, _startX, _startY, _oldX, _oldY, _newX, _newY );

                    // 更新位置
                    _oldX = _newX;
                    _oldY = _newY;
                });

                // 鼠标 弹起事件（一次性）
                $(this).one('mouseup', function(e){
                    //console.log('弹起');

                    _endX = e.offsetX;
                    _endY = e.offsetY;
                    _newX = e.offsetX;
                    _newY = e.offsetY;

                    $(this).off('mousemove'); // 取消 鼠标 移动事件
                    if( mouseupFunc ) mouseupFunc( e, _startX, _startY, _endX, _endY );
                });

            });
        },


        // 按钮 事件监听
        addBtnEvent: function(){

            var _self = this;

            // 选择图片，图片预览
            $('.selectFileBtn').change( function(){

                var _file = $(this)[0].files[0];
                var _reader = new FileReader();

                if( _reader ){

                    //文件读取器读取文件的事件监听
                    _reader.onloadend = function () {//文件加载完成

                        var img = new Image();//新建img对象
                        img.onload = function () {//设置其onload事件
                            _self.initCanvasAndDrawPicture( img );
                        };
                        img.src = _reader.result;//加载img对象
                    };
                    _reader.onerror = function () { console.error('reader error'); };

                    _reader.readAsDataURL( _file );//实际操作，文件读取器，以URL的方式读取图片文件，使用base-64进行编码
                }
            });

            // 图片上传
            $('.upLoadFileBtn').click( function(){

                var dataurl = _self.canvas.toDataURL('image/png');
                var blob = dataURLtoBlob(dataurl);

                var _formData = new FormData();
                _formData.append('file', blob, "image.png" );

                $.ajax({
                    type: 'POST',
                    url:  'http://119.29.169.29/devzhaoshifu/api.php/Upload/qiniuUpload',
                    data: _formData,
                    processData: false,
                    contentType: false,
                    success: function (res) {//上传成功
                        console.log( res );
                    },
                    error: function (err) {console.log(err);}
                });


                //（辅助函数）将图片转化为数据库的存储格式
                function dataURLtoBlob(dataurl) {

                    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
                    var bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                    while( n-- ) u8arr[n] = bstr.charCodeAt(n);
                    return new Blob([u8arr], {type:mime});
                }
            });


            /**************** 画图功能 *******************/

            // 选择 绘制 线条颜色
            $('.setColorInput').change( function(){
               _self.lineColor = $(this).val();
            });

            // 撤销 按钮 点击事件
            $('.restoreBtn').click( function(){
                _self.canvasContext.restore();
            });


            ////////////////////////////////////////////////////////////////////

            // 裁剪box 拖动事件
            this.addDragEvent( function(e){
            }, function( e, _startX, _startY, _oldX, _oldY, _newX, _newY ){
                _self.$canvasClipBox.css({
                    left: '+=' + ( _newX - _startX ) + 'px',
                    top: '+=' + ( _newY - _startY ) + 'px'
                });
            }, function(e){
            }, _self.$canvasClipBox.find('.clipBoxMoveBtn'));

            ////////////////////////////////////////////////////////////////////

            // 绘制文字 textarea输入框 拖动事件
            this.addDragEvent( function(e){
            }, function( e, _startX, _startY, _oldX, _oldY, _newX, _newY ){
                _self.$canvasTextAreaBox.css({
                    left: '+=' + ( _newX - _startX ) + 'px',
                    top: '+=' + ( _newY - _startY ) + 'px'
                });
            }, function(e){
            }, _self.$canvasTextAreaBox.find('.canvasTextArea'));


            // 绘制文字 字体下拉列表
            _self.$canvasTextAreaBox.find('.fontSizeConfig').on( 'change', function(){
                _self.$canvasTextAreaBox.find('.canvasTextArea').css( 'font-size', $(this).val() + 'px' );
            });

            // 绘制文字 字体颜色
            _self.$canvasTextAreaBox.find('.colorConfig').on( 'change', function(){
                _self.$canvasTextAreaBox.find('.canvasTextArea').css( 'color', $(this).val() );
            });

            // 绘制文字 关闭按钮 点击事件
            _self.$canvasTextAreaBox.find('.closeBtn').on( 'click', function(){
                _self.$canvasTextAreaBox.hide();
                _self.$canvasTextAreaBox.find('.canvasTextArea').val('');// 清空内容
            });

            // 绘制文字 编辑完成 按钮 点击事件
            _self.$canvasTextAreaBox.find('.textAreaEditFinishBtn').on( 'click', function(){

                var $canvas = $(_self.canvas);
                var $canvasTextAreaBox = _self.$canvasTextAreaBox;//　box
                var $canvasTextArea = $canvasTextAreaBox.find('.canvasTextArea');// 输入框

                // 设置 字体内容、样式
                var _text = $canvasTextArea.val();
                var _fontSize = $canvasTextAreaBox.find('.fontSizeConfig').val();
                var _color = $canvasTextAreaBox.find('.colorConfig').val();

                // 设置字体位置
                var _canvasPosAndSizeObj = _self.getItemPosAndSize( $(_self.canvas) );

                var _posX = $canvasTextAreaBox.position().left + $canvasTextArea.position().left - _canvasPosAndSizeObj.left;
                var _posY = $canvasTextAreaBox.position().top + $canvasTextArea.position().top + parseInt(_fontSize) - _canvasPosAndSizeObj.top;

                _self.drawText( _text, _fontSize, _color, _posX, _posY );// 绘制文字
                _self.$canvasTextAreaBox.find('.closeBtn').trigger('click');// 点击关闭按钮
            });

            //////////////////////////////////////////////////////////////////////////

            // DIY涂鸦按钮 点击事件
            $('.drawDiyBtn').click( function(){

                if( _self.canvas ){
                    $( _self.canvas ).attr( 'class', 'drawDiyCursor' );// 鼠标 cursor样式

                    // 增加 在canvas上 的拖动事件
                    _self.addDragEvent( function(e){ // mousedown
                    }, function( e, _startX, _startY, _oldX, _oldY, _newX, _newY ){ // mousemove
                        _self.drawDiy( _oldX, _oldY, _newX, _newY ); // 自由绘制

                    }, function(e){ // mouseup
                    });
                }
            });

            // 绘制圆形按钮 点击事件
            $('.drawCircleBtn').click( function(){

                if( _self.canvas ) {
                    $( _self.canvas ).attr('class', 'drawCircleCursor');// 鼠标 cursor样式

                    // 增加 在canvas上 的拖动事件
                    _self.addDragEvent( function (e) { // mousedown
                    }, function (e, _startX, _startY, _oldX, _oldY, _newX, _newY) { // mousemove
                        //_self.drawCircle( _startX, _startY, _newX, _newY ); // 绘制圆形

                    }, function (e, _startX, _startY, _endX, _endY) { // mouseup
                        _self.drawCircle( _startX, _startY, _endX, _endY ); // 绘制圆形
                    });
                }
            });

            // 绘制文字按钮 点击事件
            $('.drawTextBtn').click( function(){

                if( _self.canvas ) {

                    var $canvas = $( _self.canvas );
                    $canvas.off().attr('class', '');// 鼠标 cursor样式

                    var _canvasPosAndSizeObj = _self.getItemPosAndSize( $(_self.canvas) );

                    var _$canvasTextAreaBox_width = parseInt( _self.$canvasTextAreaBox.css('width') );
                    var _$canvasTextAreaBox_height = parseInt( _self.$canvasTextAreaBox.css('height') );
                   

                    // 调整 输入框的位置，在canvas内 居中显示
                    _self.$canvasTextAreaBox.css({
                        left: 'calc( ' + ( _canvasPosAndSizeObj.left + ( _canvasPosAndSizeObj.width - _$canvasTextAreaBox_width ) / 2 ) + 'px )',
                        top: 'calc( ' + ( _canvasPosAndSizeObj.top + ( _canvasPosAndSizeObj.height - _$canvasTextAreaBox_height ) / 2 ) + 'px )'
                    });
                    _self.$canvasTextAreaBox.show(); // 显示编辑框
                }
            });


            // 左转 按钮 点击事件
            $('.rotateLeftBtn').click( function(){
                _self.rotateCanvas( true );
            });

            // 右转 按钮 点击事件
            $('.rotateRightBtn').click( function(){
                _self.rotateCanvas( false );
            });


            // 裁剪 按钮 点击事件
            $('.clipPictureBtn').click( function(){

                // 调整 裁剪box的样式，并显示
                var _canvasPosAndSizeObj = _self.getItemPosAndSize( $(_self.canvas) );

                _self.$canvasClipBox.css({
                    'width': 'calc(' + _canvasPosAndSizeObj.width * 0.4 + 'px)',
                    'height': 'calc(' + _canvasPosAndSizeObj.height * 0.4 + 'px)',
                    'left': 'calc(' + _canvasPosAndSizeObj.width * 0.3 + 'px)',
                    'top': 'calc(' + _canvasPosAndSizeObj.height * 0.3 + 'px',
                }).show();
            });

            // 裁剪完成 按钮点击事件
            _self.$canvasClipBox.find('.clipFinishBtn').click( function(){

                var _clipBoxPosAndSizeObj = _self.getItemPosAndSize( _self.$canvasClipBox );

                var _startX = _clipBoxPosAndSizeObj.left;
                var _startY = _clipBoxPosAndSizeObj.top;
                var _endX = _startX + _clipBoxPosAndSizeObj.width;
                var _endY = _startY + _clipBoxPosAndSizeObj.height;

                _self.clipPicture( _startX, _startY, _endX, _endY ); // 裁剪
                _self.$canvasClipBox.hide(); // 隐藏
               
            });

        },

    }
})( jQuery );


