<?php
  // User info
  global $current_user;
  get_currentuserinfo();
  $user_id = $current_user->ID;
  $user_display_name = $current_user->display_name;
  $user_avatar = get_avatar( $user_id, 24, null, null, array('class' => 'img-circle'));
?>
      <nav class="navbar navbar-light bg-faded">
  <a class="navbar-brand" href="/">
    <img src="<?php echo get_template_directory_uri(); ?>/dist/images/site-header-logo.png" height="30"/><?php //bloginfo('name'); ?>
  </a>

  <?php
  if (has_nav_menu('primary_navigation')) :
    wp_nav_menu(['theme_location' => 'primary_navigation', 'walker' => new wp_bootstrap_navwalker(), 'menu_class' => 'nav navbar-nav']);
  endif;
  ?>

  <?php
  // if (has_nav_menu('user_actions') && is_user_logged_in()) :
  //   wp_nav_menu(['theme_location' => 'user_actions', 'walker' => new wp_bootstrap_navwalker(), 'menu_class' => 'nav navbar-nav']);
  // endif;
  ?>

  <div class="menu-user-container pull-right">
    <ul class="nav navbar-nav">
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href id="supportedContentDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><?php echo $user_avatar; echo $user_display_name; ?></a>
        <div class="dropdown-menu" aria-labelledby="supportedContentDropdown">
          <?php if(is_user_logged_in()) {?>
            <a class="dropdown-item" href="/account">Mijn account</a>
            <a class="dropdown-item" href="/inleg">Nieuwe inleg</a>
            <a class="dropdown-item" href="/dashboard/transacties">Mijn transacties</a>
          <?php } else { ?>
            <a class="dropdown-item" href="/login">Login</a>
          <?php } ?>
        </div>
      </li>
    </ul>
  </div>

  <!-- <form class="form-inline float-xs-right">
    <input class="form-control" type="text" placeholder="Search">
    <button class="btn btn-outline-success" type="submit">Search</button>
  </form> -->
</nav>
