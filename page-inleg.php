
<?php get_template_part('templates/page', 'header'); ?>

<?php
if (!is_user_logged_in()) {
  get_template_part('templates/login');
  return;
}
?>

<div class="content-wrapper">
  <div class="container">

      <div class="col-xs-12">
        <p>Doe een nieuwe inleg bij De Haagse Munt. </p>

        <form id="new_payment" name="new_payment" method="post" action="<?php echo esc_url( admin_url('admin-post.php') ); ?>">
          <div class="form-group row">
            <label for="amount" class="col-sm-2 col-form-label">Inleg</label>
            <div class="col-sm-10">
              € <input type="text" class="form-control" id="amount" value="10" tabindex="10" size="20" name="amount" required placeholder="€"/>
            </div>
            <div class="offset-xs-2">Bedrag (minimaal €10,-, maximaal €100,-)</div>
          </div>

          <div class="form-group row">
            <label for="donation" class="col-sm-2 col-form-label">Extra donatie</label>
            <div class="col-sm-10">
              € <input class="form-control" id="donation" tabindex="11" name="donation" cols="50" rows="6" required placeholder="€" type="text"></input>
            </div>
            <div class="offset-xs-2">Optionele donatie aan De Haagse Munt organisatie.</div>
          </div>

          <table class="table table-striped">
            <thead>
              <tr>
                <th>Omschrijving</th>
                <th>Bedrag</th>
              </tr>
            </thead>
            <tr>
              <td>Inleg</td>
              <td class="payment"></td>
            </tr>
            <tr>
              <td>Transactiekosten (€2 + 5%)</td>
              <td class="costs"></td>
            </tr>
            <tr>
              <td>Donatie</td>
              <td class="donation"></td>
            </tr>
            <tr class="sum">
              <td>TOTAAL</span></td>
              <td class="total_amount"></td>
            </tr>
          </table>

          <div class="form-group row">
            <div class="offset-sm-2 col-sm-10 action-buttons">
              <input type="hidden" name="action" value="new_payment" />
              <input type="hidden" name="costs"  />
              <?php wp_nonce_field( 'new-payment' ); ?>
              <button class="btn btn-primary" type="submit"><img src="<?php echo get_template_directory_uri() . '/dist/images/ideal.png'; ?>" height="24"/> Betalen met iDeal</button>
            </div>
          </div>
        </form>
      </div>
  </div>
</div>


<script>
  // http://jsfiddle.net/Ajkkb/26/
  (function($) {
    $(document).ready(function() {

      function calculateTotal() {
        // payment
        var amount = parseFloat($('input[name=amount]').val().replace(',', '.')).toFixed(2) || 0;
        if (isNaN(amount)) { amount=10; }
        if (amount<10) { amount=10; }
        if (amount>100) { amount=100; }
        $('input[name=amount]').val(amount);
        $('.payment').text('€ ' + amount);
        // donation
        var donation = parseFloat($('input[name=donation]').val().replace(',','.')).toFixed(2) || 0;
        if (isNaN(donation)) { donation=0; }
        if (donation<0) { donation=0; }
        if (donation>1000) { donation=1000; }
        if (donation>=0) { $('input[name=donation]').val(donation); }
        $('.donation').text('€ ' + donation);
        //costs
        var costs = parseFloat(2 + amount/20).toFixed(2) || 0;
        if (costs<0) { costs=0; }
        $('input[name=costs]').val(costs);
        $('.costs').text('€ ' + costs);
        // Total
        total = parseFloat(amount) + parseFloat(costs) + parseFloat(donation);
        total = total.toFixed(2);
        $('.total_amount').text('€ ' + total);

        // disable submit if not ok

      }

      $('input[name=amount],input[name=donation]').change(function(e) {
        calculateTotal();
      });

      calculateTotal();
  });

//isNumeric function Stolen from:
//http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric

function IsNumeric(input) {
  return (input - 0) == input && input.length > 0;
}

})(jQuery);
</script>
