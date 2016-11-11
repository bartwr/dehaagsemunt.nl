<?php
  // Only logged in users.
  if (!is_user_logged_in()) {
    get_template_part('templates/page', 'header');
    get_template_part('templates/login');
    return;
  }

  // Get account info
  global $current_user;
  get_currentuserinfo();
  $user_id = $current_user->ID;
  if ($user_id==0) { $user_id = -1; }
  $user_display_name = $current_user->display_name;

  // Get curernt balance info
  $args = array(
    'post_type' => 'balance',
    'posts_per_page' => 1,
    'author' => $current_user->ID
  );
  $loop = new WP_Query($args);
  while ( $loop->have_posts() ) : $loop->the_post();
    $balance = get_field('balance');
    $balance_meta = get_field('balance_meta');
  endwhile; wp_reset_query();

  // Transaction info

?>
<?php get_template_part('templates/page', 'header'); ?>
<div class="dashboard-wrapper">
  <div class="container">
    <section class="row">
      <div class="col-xs-12">
        <div class="row">
          <div class="col-xs-12 col-sm-4 overview">
            <h3>Overzicht</h3>
            <p>Je hebt op dit moment<br>
              <span class="amount"><?php echo $balance; ?></span> HM</p>
          </div>

          <div class="col-xs-12 col-sm-4">
            <h3>Freshness</h3>
            <div google-chart chart="vm.chartFreshness"></div>
          </div>

          <div class="col-xs-12 col-sm-4">
            <h3>Balans</h3>
            <div google-chart chart="vm.chartBalances"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="row">
      <div class="col-xs-12">
        <div class="block transactions">
          <div class="block-title">Recente transacties</div>
          <div class="block-content">
            <table class="table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>id</th>
                  <th>Type</th>
                  <th>Bedrag</th>
                  <th>Tegenrekening</th>
                  <th>Opmerkingen</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <?php $args = array(
                  'post_type' => 'transaction',
                  'posts_per_page' => 20,
                  'orderby' =>  'date',
                  'order' => 'DESC',
                  'meta_key'		=> 'transaction_from',
                  'meta_value'	=> $current_user->ID
                );
                $posts = get_posts($args);

                if (count($posts)<1) {
                  echo '<tr><td>Je hebt nog geen transacties.</td</tr>';
                }

                foreach($posts as $post) : setup_postdata($post); ?>
                  <?php $to = get_field('transaction_to'); ?>
                  <?php $from = get_field('transaction_from'); ?>
                  <tr>
                    <td class="date"><?php the_time(get_option('date_format')); ?></td>
                    <td class="transaction-id"><?php the_id(); ?></td>
                    <td class="type"><?php the_field('transaction_type'); ?></td>
                    <td class="amount"><?php the_field('transaction_amount'); ?> HM</td>
                    <td class="to"><?php echo $to['display_name']; ?></td>
                    <td class="description"><?php echo $from['display_name']; ?></td>
                    <td class="view"><a href="<?php the_permalink(); ?>">Bekijk</a></td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>

            <a href="/inleg" class="btn btn-primary">Nieuwe inleg</a>
            <a href="/dashboard/transacties" class="more">Bekijk alle transacties</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>
