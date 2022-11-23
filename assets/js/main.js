$(document).ready(function() {
  var sidebarWidth = $('.sidebar-parent').width();
  $('.sidebar-parent').width(sidebarWidth);
  function setSidebar() {
    if ($(window).scrollTop() > 70) {
      $('.sidebar-parent').addClass('fixed');
    } else {
      $('.sidebar-parent').removeClass('fixed');
    }
  }
  setSidebar();
  $(window).scroll(function(){
    setSidebar();
  });

  $('.navbar .nav-item').removeClass('active');
  $('.navbar .nav-link[href="' + window.location.pathname + '"]').parent().addClass('active');
});
