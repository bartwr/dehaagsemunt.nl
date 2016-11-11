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
    // dates
    $now = new DateTime();
    $date_filed = new DateTime(get_field('request_date_filed', false, false));
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
            <div class="request-body">
              <h3>Het verzoek</h3>
              <div class="request-letter">
                <?php if ($request_status == 'concept') {
                  echo '<span class="request-status concept">Concept</span>';
                } ?>
                <?php if (get_field('request_date_filed')) {
                  $date = get_field('request_date_filed');
                  $date=$date;
                } else {
                  $date = date('j F Y');;
                }
                ?>
                <span class="request-date"><?php echo $date; ?><br></span>
                Aan: <?php echo $request_organization_name; ?><br>
                Van: <em>[geanonimiseerd]</em> <?php //echo $author; ?><br>
                Referentie: <?php the_permalink(); ?><br><br>
                Betreft: Verzoek tot open data publicatie<br><br>

                Beste <?php echo $request_organization_name ?>, <br><br>

                <div class="request-content">
                  <?php the_content(); ?>
                </div>

                Met vriendelijke groet,<br><br>
                <em>[geanonimiseerd]</em><?php //echo $author; ?>

                <div class="request-actions">
                  <?php
                  global $current_user;
                  get_currentuserinfo();
                  $user_id = (int)$current_user->ID;
                  $author_id = (int)get_the_author_meta('ID');
                  if( is_user_logged_in() && ($author_id == $user_id) ) {
                    if ($request_status=='concept') { ?>
                      <a href data-toggle="modal" data-target="#modalEditRequest"><i class="fa fa-pencil"></i> Wijzigen</a>
                      <a href data-toggle="modal" data-target="#modalSubmitConcept" class="btn btn-primary">Indienen</a>
                    <?php } ?>
                  <?php } ?>
                </div>
              </div>
            </div>

            <div class="request-communication">
              <h3>Communicatie</h3>
              <?php $args = array(
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
              if (!$loop->have_posts()){
                echo 'Er is nog geen communicatie over dit verzoek. ';
              }
              echo '<dl class="row">';
              while ( $loop->have_posts() ) : $loop->the_post(); ?>
                <dt class="col-sm-3"><?php the_date(); ?> </dt>
                <dd class="col-sm-9"><?php the_content(); ?></dd>
              <?php endwhile; wp_reset_query();?>
            </div>

            <div class="request-updates">
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
              if (!$loop->have_posts()){
                echo 'Er is nog geen communicatie over dit verzoek. ';
              }
              echo '<dl class="row">';
              while ( $loop->have_posts() ) : $loop->the_post(); ?>

                <dt class="col-sm-3"><?php echo get_the_date(); ?> </dt>
                <dd class="col-sm-9"><?php echo get_the_title(); ?></dd>

              <?php endwhile; wp_reset_query();?>

            </div>
          </div>

          <div class="col-xs-12 col-sm-4 side">
            <div class="request-details">
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
                <dd class="col-sm-8"><?php echo $request_organization_name; ?>
                  <?php if ($request_organization_id) {
                    echo '<i class="fa fa-check verified"></i>';
                  }?>
                </dd>

                <?php if (get_field('request_date_filed')) { ?>
                  <dt class="col-sm-4">Datum ingediend: </dt>
                  <dd class="col-sm-8"><?php echo $date_filed->format('j M Y'); ?></dd>
                </dl>

                <div class="days-count">
                  Aantal dagen sinds indiening: <br>
                  <span class="count"><?php echo $now->diff($date_filed)->d;?></span>
                </div>
                <?php } ?>

            </div>

            <div class="comments">
              <?php comments_template('/templates/comments.php'); ?>
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

<!-- Modals -->
<div class="modal fade" id="modalEditRequest" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <form id="update_request" name="update_request" method="post" action="<?php echo esc_url( admin_url('admin-post.php') ); ?>">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title" id="myModalLabel">Verzoek wijzigen</h4>
        </div>
        <div class="modal-body">
          <div class="form-group row">
            <label for="description" class="col-xs-12 col-form-label">Beschrijving van het verzoek</label>

            <div class="col-xs-12">
              <textarea class="form-control" id="description" tabindex="11" name="description" cols="50" rows="6" placeholder="Beschrijving van het verzoek" required><?php echo stripslashes(get_the_content()); ?></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <a href data-dismiss="modal">Sluiten</a>
          <input type="hidden" name="action" value="update_request" />
          <?php wp_nonce_field( 'update-request' ); ?>
          <button class="btn btn-primary" type="submit">Verzoek wijzigen</button>
        </div>
      </form>
    </div>
  </div>
</div>

<div class="modal fade" id="modalSubmitConcept" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <form id="submit_concept_request" name="submit_concept_request" method="post" action="<?php echo esc_url( admin_url('admin-post.php') ); ?>">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title" id="myModalLabel">Verzoek indienen</h4>
        </div>
        <div class="modal-body">
          <p>Is je aanvraag compleet? Verzend hem dan nu! Na controle door open publicatie wordt je aanvraag verstuurd. </p>
        </div>
        <div class="modal-footer">
          <a href data-dismiss="modal">Sluiten</a>
          <input type="hidden" name="action" value="submit_concept_request" />
          <?php wp_nonce_field( 'new-post' ); ?>
          <button class="btn btn-primary" type="submit">Verzoek wijzigen</button>
        </div>
      </form>
    </div>
  </div>
</div>
