<!-- Start of remove Zendesk branding script -->
<script type="text/javascript">
   zE(function() {
     setTimeout(function(){
       var regex	= /Zendesk [a-z ]+ window/i;
       var ifEles	= document.getElementsByTagName("iframe");
       for (var x=0; x < ifEles.length; x++) {
         if (ifEles[x].title.match(regex) !== null) {
           //found the frame
           var zdDoc	= ifEles[x].contentWindow ? ifEles[x].contentWindow.document : ifEles[x].contentDocument;
           var els	=  zdDoc.querySelectorAll("div.meshim_widget_widgets_Branding.branding");
           if (els.length == 1) {
             els[0].style.display="none";
             console.log("hid zd logo");
           }
         }
       }
     }, 1000);
   });
</script>
<!-- End of remove Zendesk branding script -->
