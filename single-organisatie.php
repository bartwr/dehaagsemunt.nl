<?php while (have_posts()) : the_post(); ?>

  <?php
    $request_status = get_field('request_status');
    $organization = get_field('request_organization');
    if ($organization) {
      $request_organization_name = $organization[0]->post_title;
      $request_organization_id = $organization[0]->ID;
    } else {
      $request_organization_name = get_field('request_organization_input');
    }

    // global $current_user;
    // get_currentuserinfo();
    // $username = $current_user->display_name;
    $author = get_the_author();

  ?>

  <article <?php post_class(); ?>>
    <header class="page-header">
      <div class="container">
        <div class="row">
          <div class="col-xs-12">
            <h3>Organisatie</h3>
            <h1><?php the_title(); ?></h1>
          </div>
        </div>
      </div>
    </header>
    <div class="entry-content">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-sm-8">
            <?php
            if ( has_post_thumbnail() ) {
	            the_post_thumbnail('medium');
            }
            ?>
            <div class="organization-requests">

              <h3>Verzoeken voor <?php the_title(); ?></h3>
              <ul>
              <?php $args = array(
                'post_type' => 'verzoek',
                'posts_per_page' => -1 ,
                'meta_query' => array(
  								array(
  									'key' => 'request_organization', // name of custom field
  									'value' => '"' . get_the_ID() . '"', // matches exaclty "123", not just 123. This prevents a match for "1234"
  									'compare' => 'LIKE'
  								)
  							)
              );
              $loop = new WP_Query($args);

              while ( $loop->have_posts() ) : $loop->the_post(); ?>
                <li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
              <?php endwhile; wp_reset_query();?>
            </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer>
      <div class="container">
        <?php wp_link_pages(['before' => '<nav class="page-nav"><p>' . __('Pages:', 'sage'), 'after' => '</p></nav>']); ?>
      </div>
    </footer>

  </article>
<?php endwhile; ?>
