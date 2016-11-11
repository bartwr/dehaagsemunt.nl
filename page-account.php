<?php
  global $current_user;
  get_currentuserinfo();
  $user_id = $current_user->ID;
  $user_display_name = $current_user->display_name;
  $user_email = $current_user->user_email;
?>
<?php get_template_part('templates/page', 'header'); ?>
<?php // Only logged in users.
  if (!is_user_logged_in()) {
    get_template_part('templates/page', 'header');
    get_template_part('templates/login');
    return;
  }
?>
<div class="container">
  <div class="row">
    <div class="col-xs-12 profiel section">
      <h3>Profiel instellingen</h3>
      Username: <?php echo $user_display_name; ?><br>
      Email: <?php echo $user_email; ?>
    </div>

    <div class="col-xs-12 profiel section">
      <h3>Betalingen</h3>
      <?php
      $args = array(
        'post_type' => 'payment',
        'posts_per_page' => -1,
        'author' => $user_id
      );
      $loop = new WP_Query($args);
      if (!$loop->have_posts()) {
        echo '<p>Nog geen betalingen gedaan. </p>';
      } else { ?>
        <table class="table">
          <thead>
              <tr>
                <th>ID</th>
                <th>Datum</th>
                <th>Inleg</th>
                <th>Transactiekosten</th>
                <th>Donatie</th>
                <th>Beschrijving</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <?php while ( $loop->have_posts() ) : $loop->the_post(); ?>
                <tr>
                  <td><?php the_id(); ?></td>
                  <td><?php echo get_the_date(); echo ' - '; echo get_the_time();?></td>
                  <td>€ <?php the_field('payment_amount'); ?></td>
                  <td>€ <?php the_field('payment_costs'); ?></td>
                  <td>€ <?php the_field('payment_donation'); ?></td>
                  <td><?php the_title(); ?></td>
                  <td><?php the_field('payment_status'); ?></td>
                </tr>
              <?php endwhile; ?>
            </tbody>
          </table>
      <?php }
      wp_reset_query();
      ?>
      <a class="btn btn-primary">Nieuwe inleg</a>
    </div>

    <div class="col-xs-12 account section">
      <h3>Account instellingen</h3>
      Account type: starter<br>
      <a class="btn btn-warning">Uitloggen</a>
    </div>

    <div class="col-xs-12 danger section">
      <h3>Danger zone</h3>
      <a class="btn btn-danger">Account opzeggen</a>
  </div>
</div>
