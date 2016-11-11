<?php while (have_posts()) : the_post(); ?>

  <?php

  $request_id = get_field('communication_request_reference', get_the_ID() );
  echo $request_id[0]->ID;
  $direction  = get_field('communication_send_receive', $post_id );
  echo $direction;
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
            <h2>Verzoek tot open publicatie</h2>
            <h1><?php the_title(); ?></h1>
          </div>
        </div>
      </div>
    </header>
    <div class="entry-content">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-sm-8">
            <h3>Het verzoek</h3>
            <div class="request-letter">
              <?php if ($request_status == 'concept') {
                echo '<span class="request-status concept">Concept</span>';
              } ?>
              <?php if (the_field('request_date_filed')) {
                $date = get_field('request_date_filed');
              } else {
                $date = date('j F Y');;
              }
              ?>
              <span class="request-date"><?php echo $date; ?><br></span>
              Aan: <?php the_field('request_organization_input'); ?><br>
              Van: <?php echo $author; ?><br>
              Referentie: <?php the_permalink(); ?><br><br>
              Betreft: Verzoek tot open data publicatie<br><br>

              Beste <?php echo $request_organization_name ?>, <br><br>

              <div class="request-content">
                <?php the_content(); ?>
              </div>

              Met vriendelijke groet,<br><br>
              <?php echo $author; ?>

              <div class="request-actions">
                <?php if( is_user_logged_in() && is_author(get_current_user_id())) {

                  if ($request_status=='concept') { ?>
                    <a href class=""><i class="fa fa-pencil"></i> Wijzigen</a>
                    <a class="btn btn-primary">Indienen</a>
                  <?php } ?>
                  <?php if ($request_status=='ready') { ?>
                    <a class="btn btn-primary">Verzenden</a>
                  <?php }
                } ?>
              </div>
            </div>
          </div>
          <div class="col-xs-12 col-sm-4 request-details">
            <h3>Details</h3>
            <dl class="row">
              <dt class="col-sm-4">Aangemaakt: </dt>
              <dd class="col-sm-8"><?php the_date(); ?></dd>

              <dt class="col-sm-4">Status: </dt>
              <?php
              $field = get_field_object('request_status', get_the_ID());
              ?>
              <dd class="col-sm-8"><?php echo $field['choices'][$field['value']]; ?></dd>

              <dt class="col-sm-4">Bronhouder: </dt>
              <dd class="col-sm-8"><?php echo $request_organization_name; ?></dd>

              <?php if (the_field('request_date_filed')) { ?>
                <dt class="col-sm-4">Datum ingediend: </dt>
                <dd class="col-sm-8"><?php the_field('request_date_filed'); ?></dd>
              <?php } ?>
            </dl>

          </div>
        </div>
<br>
        <div class="row">
          <div class="col-xs-12 col-sm-8 request-communication">
            <h3>Communicatie</h3>

            <?php // Fetch update

            $args = array(
              'post_type' => 'communication',
              'posts_per_page' => -1 ,
              'meta_query' => array(
								array(
									'key' => 'communication_request_reference', // name of custom field
									'value' => '"' . get_the_ID() . '"', // matches exaclty "123", not just 123. This prevents a match for "1234"
									'compare' => 'LIKE'
								)
							)
            );
            $loop = new WP_Query($args);
            echo '<dl class="row">';
            while ( $loop->have_posts() ) : $loop->the_post(); ?>

              <dt class="col-sm-3"><?php the_date(); ?> </dt>
              <dd class="col-sm-9"><?php the_content(); ?></dd>

            <?php endwhile; wp_reset_query();?>


          </div>

          <div class="col-xs-12 col-sm-8">
            <h3>Updates</h3>

            <?php // Fetch update

            $args = array(
              'post_type' => 'update',
              'posts_per_page' => -1 ,
              'meta_query' => array(
								array(
									'key' => 'update_relation_post', // name of custom field
									'value' => '"' . get_the_ID() . '"', // matches exaclty "123", not just 123. This prevents a match for "1234"
									'compare' => 'LIKE'
								)
							)
            );
            $loop = new WP_Query($args);
            echo '<dl class="row">';
            while ( $loop->have_posts() ) : $loop->the_post(); ?>

              <dt class="col-sm-3"><?php echo get_the_date(); ?> </dt>
              <dd class="col-sm-9"><?php echo get_the_title(); ?></dd>

            <?php endwhile; wp_reset_query();?>

          </div>
          <div class="col-xs-12 col-sm-4">
            <?php comments_template('/templates/comments.php'); ?>
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
