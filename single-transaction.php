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
  </article>
<?php endwhile; ?>

from: <?php echo the_field('transaction_from');?> <br>
to: <?php get_field('transaction_to');?> <br>
amount: <?php echo the_field('transaction_amount');?> <br>
type: <?php echo the_field('transaction_type');?> <br>
