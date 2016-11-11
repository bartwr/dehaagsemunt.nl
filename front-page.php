<div class="site-content">
  <section class="header">
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-sm-6">
          <h1>Laten we manier waarop we samenwerken in Den Haag veranderen! Lokale kennis en producten uitwisselen was nog nooit zo makkelijk! </h1>
          <div class="large-font">
            <p>Met De Haagse Munt wisselen we samen kennis en faciliteiten, met een lokale munt. Ondersteun de lokale makers, ontwikkelaars en winkeliers. Samen maken we Den Haag nog mooier!</p>
          </div>

          <div class="action">
            <?php if(is_user_logged_in()) { ?>
              <a href="/dashboard" class="btn btn-primary">Naar mijn dashboard</a>
            <?php } else { ?>
              <a class="btn btn-primary" href="/login">Aanmelden</a>
              <?php } ?>
          </div>
        </div>

        <div class="col-xs-12 col-sm-6">
          <img class="img-fluid" src="<?php echo get_template_directory_uri(); ?>/dist/images/hero_1.png"/>
      </div>
    </div>
  </section>

  <section class="second row">
    <div class="container">
      <div class="col-xs-12">
        <h2>De Haagse Munt maakt het mogelijk écht lokaal te handelen.</h2>
      </div>
    </div>
  </section>

  <section class="third row">
    <div class="container">
      <div class="col-xs-12">
        <div class="row">
          <div class="col-xs-12 col-sm-6 large-font">
            <h3>De Haagse Munt brengt een andere economie met een lokale munt naar Den Haag. </h3>
            Binnen de Haagse Munt betalen we elkaar met een eigen digitale rentevrije munt. Een nieuwe, betere economie kan alleen plaats vinden als we daar bewust voor kiezen. Samen bouwen we samen aan een <em>complementair</em> geldsysteem, een lokale marktplaats met de Haagse Munt, zonder banken, rente en aandeelhouders.
          </div>
          <div class="col-xs-12 col-sm-6">
            <img src="<?php echo get_template_directory_uri(); ?>/dist/images/hero_2.png" class="img-fluid"/>
          </div>
        </div>

        <div class="row">
          <div class="col-xs-12 col-sm-6 large-font">
            <img src="<?php echo get_template_directory_uri(); ?>/dist/images/hero_3.png" class="img-fluid"/>
          </div>
          <div class="col-xs-12 col-sm-6 large-font">
            <h3>De Munt voegt meerdere keren waarde toe in de regio.</h3>
            Door elkaar met lokaal geld te betalen, betaal je niet alleen voor een lokaal product of dienst, je geeft ook je waarden door aan de volgende ondernemer of persoon, en die weer aan de volgende. We maken de regio letterlijk en figuurlijk <em>rijker</em>. De Munt draagt bij aan een zelfredzame samenleving die minder afhankelijk wordt van (financiële) invloeden van buitenaf. Open nu een rekening bij De Haagse Munt!
          </div>
        </div>

        <div class="row">
          <div class="col-xs-12 col-sm-6 large-font">
            <h3>Duurzame ontwikkeling</h3>
            We versterken de <strong>economische duurzaamheid</strong>. Geldstromen circuleren meer en langer binnen de regio. Iedere munt creëert meerdere keren waarde binnen de lokale economie. We bevorderen de <strong>sociale duurzaamheid</strong> omdat mensen kunnen deelnemen aan de lokale economie. Lokale bedrijven gaan op zoek naar ongebruikte capaciteit. Een eigen lokale munt activeert mensen en vergroot de betrokkenheid in de samenleving. <strong>Ecologische duurzaamheid</strong> wordt versterkt door lokaal geproduceerde goederen en diensten. Er worden minder kilometers gemaakt. We ruilen producten en diensten die bijdragen aan een gezonde en duurzame lokale economie voor onszelf en de opkomende generaties.
          </div>
          <div class="col-xs-12 col-sm-6">
            <img src="<?php echo get_template_directory_uri(); ?>/dist/images/hero_4.png" class="img-fluid"/>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="fourth row">
    <div class="container">
      <div class="col-xs-12">
        <div class="inner">
          <h2>Is De Haagse Munt voor jou? </h2>
          <p>De Haagse Munt is er voor bewoners, ondernemers, winkeliers en overheid.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="fifth row">
    <div class="container">
      <div class="col-xs-12">
        <h3>Vraag een Invite aan om op de groeiende wachtlijst voor De Haagse Munt te komen</h3>
        <a class="btn btn-primary" href="/login">Aanmelden</a>
        <p>We starten De Haagse Munt!</p>
      </div>
    </div>
  </section>
</div>
