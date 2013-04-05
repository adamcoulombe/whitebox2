(function( $ ){

  var $whitebox = $('<div id="whitebox"></div>'),
  $overlay = $('<div id="wb-overlay"></div>'),
  $view = $('<div id="wb-view"></div>'),
  $modal = $('<div id="wb-modal"></div>'),
  $content = $('<div id="wb-box">hello next</div>'),
  $close = $('<a id="wb-close"></a>'),
  $iframe = $('<iframe id="wb-iframe" />');
  var wb = {
    init:function(){
      $(function(){
        $('body').append(
                    $whitebox .append($overlay)
                    .append(
                      $view.append(
                        $modal.append($content)
                        .append($close)
                      )
                    )
                  );
        $whitebox.addClass('closed').on('whiteboxWillAppear',wb.actions.whiteboxWillAppear);
      });
    },
    getAjax:function(href){
      $.ajax(href).done(function ( data ) {
        $content.html(data);
        wb.show();
      });
    },
    getDomNode:function(href){
      $content.html($(href).html());
      wb.show();
    },
    getExternal:function(href){
      $iframe.attr('src',href);
      $content.html($iframe);
      wb.show();
    },
    show:function(){
      $whitebox.trigger('whiteboxWillAppear');
    },
    hide:function(){
      $whitebox.trigger('whiteboxWillUnload');
    },
    reset:function(){
      $modal.css({left:0, top:0});
    },
    fit:function(){
      var w={
        w:$(window).width(),
        h:$(window).height()
      }
      $whitebox.css({width:w.w,height:w.h});
      var modalSize = {
        w:$modal.outerWidth()/2,
        h:$modal.outerHeight()/2
      }
      console.log($modal.width()/2);
      $modal.css({left:w.w/2-modalSize.w,top:w.h/2-modalSize.h});
    },
    events:{
      animationend : 'animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd'
    },
    actions:{
      windowDidResize:function(){
        wb.fit();
      },
      whiteboxWillAppear:function(){
        
        $whitebox.off('whiteboxWillAppear',wb.actions.whiteboxWillAppear).removeClass('closed').addClass('show').on('whiteboxDidAppear',wb.actions.whiteboxDidAppear);
        wb.reset();
        wb.fit();
        $modal.on(wb.events.animationend,function(){
          $modal.off(wb.events.animationend);
          $whitebox.trigger('whiteboxDidAppear');
        });
        $view.on('click',function(e){
          if(e.target === this || e.target === $close.get(0)){ // only act on click events originating from $view or $close
            $view.off('click');
            wb.hide();
          }
        });
        $(window).on('resize',wb.actions.windowDidResize);
      },
      whiteboxDidAppear:function(){
        $whitebox.off('whiteboxDidAppear',wb.actions.whiteboxDidAppear).on('whiteboxWillUnload',wb.actions.whiteboxWillUnload);
      },
      whiteboxWillUnload:function(){
        $whitebox.removeClass('show').addClass('hide').off('whiteboxWillUnload',wb.actions.whiteboxWillUnload).on('whiteboxDidUnload', wb.actions.whiteboxDidUnload);
        $modal.on(wb.events.animationend,function(){
          $modal.off(wb.events.animationend);
          $whitebox.trigger('whiteboxDidUnload');
        });
      },
      whiteboxDidUnload:function(){
        $whitebox.removeClass('hide').addClass('closed').off('whiteboxDidUnload', wb.actions.whiteboxDidUnload).on('whiteboxWillAppear',wb.actions.whiteboxWillAppear);
        $(window).off('resize',wb.actions.windowDidResize);
      }
    }

  }

  wb.init();
  
  $.fn.whitebox = function( options , fn) {
    var defaults = {
      callback : null
    }
    options = $.extend(options,defaults);

    return this.each(function(){
      $(this).click(function(e){
        e.preventDefault();
        var external = RegExp('^((f|ht)tps?:)?//(?!' + location.host + ')');
        var href = $(this).attr('href');
        if( external.test(href) ){
          wb.getExternal(href);
        }else{
          if (href.indexOf("#") === 0) {
            wb.getDomNode(href);
          }else{
            wb.getAjax(href);
          }
        }
        //wb.show();
      });
    });

  };

})( jQuery );

