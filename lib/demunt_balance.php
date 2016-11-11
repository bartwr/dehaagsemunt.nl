<?php

namespace Roots\Sage\Balance;

class Balance {

  public function __construct() {
    // ACF Field keys for Balance
    $fields = array(
      'balance_amount' => 'field_582479e8513f4',
      'balance_meta' => 'field_58247995513f3'
    );
  }


  /*
   * Subtract an amount from a balance and update the amount_meta
   */
  static function subtract($user_id, $amount) {

    // fetch latest balance for this user
    $args = array (
      'post_type' => 'balance',
      'numberposts' => 1,
      'meta_key'		=> 'balance_account',
      'meta_value'	=> $transaction_from_account
    );
    $post = get_posts($args);

    if (isset($post[0])) {
      $balance = get_field('balance', $post[0]->ID);
    } else {
      // Create new starting balance if no balance exists
      $args = array (
        'post_type' => 'balance'
      );
      $post_id = wp_insert_post($args);
      $balance = '[0,0,0,0,0]';
      update_field('balance', $balance, $balance_id);
    }

    // convert field string to array
    $balance = explode(",",$balance);

    // Placeholder for the new balance (old balance is needed for calculation).
    $balance_new = array();

    // traverse through each balance_step (oldest first) and transfer funds
    for ($i=count($balance); $i>0; $i--) {
      // get the value for this step in the balance array
      $step_value = $balance[ $i];
      // Check if there are still funds to be substracted, and if there are funds in this step available for subtraction
      if ($amount>0 && $step_value>0) {
        //logger.debug('There are funds in this step! ');
        $remove_value = $amount;
        // Only get out what's available
        if ($remove_value > $step_value) {
          // logger.debug('getting all funds in this step. ');
          $remove_value = $step_value;
        }
        // logger.debug('Going to remove ' + removeValue + ' from step ' + (i+1));
        // add amount to the newbalance for this step
        $balance_new[ $i] = $step_value - $remove_value;
        // subtract amount and go to next iteration.
        $amount -= $remove_value;
        if ($amount <= 0) {
          // logger.debug('Total amount subtracted');
        }
      }
    }

    $result = array(
      'old' => $balance,
      'new' => $balance_new,
    );

    return $result;
  }

  /*
   *
   */
  public function add($user_id, $amount_meta) {
    // fetch latest balance for this user
    $args = array (
      'post_type' => 'balance',
      'numberposts' => 1,
      'meta_key'		=> 'balance_account',
      'meta_value'	=> $transaction_from_account
    );
    $post = get_posts($args);

    if (isset($post[0])) {
      $balance = get_field('balance', $post[0]->ID);
    } else {
      // Create new starting balance if no balance exists
      $args = array (
        'post_type' => 'balance'
      );
      $post_id = wp_insert_post($args);
      $balance = '[0,0,0,0,0]';
      update_field('balance', $balance, $balance_id);
    }

    // convert field string to array
    $balance = explode(",",$balance);

    // Placeholder for the new balance (old balance is needed for calculation).
    $balance_new = array();

    for ($i=0; $i<count($amount_meta); $i++) {
      $balance_new[ $i] = $balance[ $i] + $amount_meta[ $i];
    }
    $balance_new = implode(',', $balance_new);

    update_field($fields['balance_meta'], $balance_id);

    $return = array (
      'old' => $balance,
      'new' => $balance_new
    );

    return $return;
  }

}

new Balance();
