lalal
<?php get_template_part('templates/page', 'header'); ?>

<?php if (!have_posts()) : ?>
  <div class="alert alert-warning">
    <?php _e('Sorry, no results were found.', 'sage'); ?>
  </div>
  <?php get_search_form(); ?>
<?php endif; ?>


<?php while (have_posts()) : the_post(); ?>
  <div class="request-list-item">
    <h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>

    <time class="updated" datetime="<?= get_post_time('c', true); ?>"><?= get_the_date(); ?></time>
    <p class="byline author vcard"><?= __('By', 'sage'); ?> <a href="<?= get_author_posts_url(get_the_author_meta('ID')); ?>" rel="author" class="fn"><?= get_the_author(); ?></a></p>

    <?php the_field('request_status'); ?>
    <!-- <div class="entry-summary">
      <?php the_excerpt(); ?>
    </div> -->
  </div>
<?php endwhile; ?>

<?php the_posts_navigation(); ?>
