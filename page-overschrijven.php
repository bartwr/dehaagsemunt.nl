
<?php get_template_part('templates/page', 'header'); ?>

<?php
if (!is_user_logged_in()) {
  get_template_part('templates/login');
  return;
}

// fetch users
$users = get_users();
$user_select = array();
foreach ($users as $user) {
  if ($user->data->ID != get_current_user_id()) {
    $u = array(
      'ID' => $user->data->ID,
      'name' => $user->data->user_login
    );
    $user_select[] = $u;
  }
}
?>

<div class="content-wrapper">
  <div class="container">

      <div class="col-xs-12">
        <p>Schrijf Haagse Munten over naar iemand anders. </p>

        <form id="transfer" name="transfer" method="post" action="<?php echo esc_url( admin_url('admin-post.php') ); ?>">

          <div class="form-group row">
            <label for="amount" class="col-sm-2 col-form-label">Bedrag</label>
            <div class="col-sm-10">
              <input type="text" class="form-control" id="amount" value="10" tabindex="10" size="20" name="amount" required placeholder="€"/>
            </div>
          </div>

          <div class="form-group row">
            <label for="to" class="col-sm-2 col-form-label">Aan</label>
            <div class="col-sm-10">
              <select name="to" class="form-control">
                <?php foreach( $user_select as $user ) : ?>
                  <option id="to" name="to" value="<?php echo $user['ID']; ?>"><?php echo $user['name']; ?></option>
                <?php endforeach; ?>
              </select>
            </div>
          </div>

          <div class="form-group row">
            <label for="description" class="col-sm-2 col-form-label">Beschrijving</label>
            <div class="col-sm-10">
              <textarea name="description" class="form-control"></textarea>
            </div>
          </div>

          <div class="form-group row">
            <div class="offset-sm-2 col-sm-10 action-buttons">
              <input type="hidden" name="action" value="transfer" />
              <?php wp_nonce_field( 'transfer' ); ?>
              <button class="btn btn-primary" type="submit">Overschrijven</button>
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
