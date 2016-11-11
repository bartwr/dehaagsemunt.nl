<?php
if (!is_user_logged_in()) { return; }

// Validate for Mollie webhook for this payment is done in demunt_payment.php hook.
// this page is not visible, redirect to account
while (have_posts()) : the_post();?>
  <article <?php post_class(); ?>>
    <header>
      <h1 class="entry-title"><?php the_title(); ?></h1>
      <?php get_template_part('templates/entry-meta'); ?>
    </header>
    <div class="entry-content">
      <?php the_content(); ?>
    </div>
    <footer>
      <?php wp_link_pages(['before' => '<nav class="page-nav"><p>' . __('Pages:', 'sage'), 'after' => '</p></nav>']); ?>
    </footer>
    <?php comments_template('/templates/comments.php'); ?>

    <pre>
      <?php
      // For now, update the status
      the_field('payment_status');
      echo '---';
      echo '<br>';
      the_field('payment_mollie_id');
      echo '---';
      echo '<br>';
      the_field('payment_mollie_details');
      echo '---';
      echo '<br>';
      // the_field('payment_transaction');
      $posts = get_field('payment_transaction');
      echo 'Transaction: ' . $posts[0]->ID;
      ?>

    </pre>

  </article>
<?php endwhile; ?>
