<?php

/**
 * Google Font
 */
function load_fonts() {
    wp_register_style('googleFonts', 'https://fonts.googleapis.com/css?family=Titillium+Web:400,200,600,900');
    wp_enqueue_style( 'googleFonts');
  }
add_action('wp_print_styles', __NAMESPACE__ . '\\load_fonts');


function demunt_custom_login() {
  echo '<link rel="stylesheet" type="text/css" href="' . get_bloginfo('stylesheet_directory') . '/dist/styles/main.css" />';
}
add_action('login_head', __NAMESPACE__ . '\\demunt_custom_login');

function demunt_login_logo_url() {
  return get_bloginfo( 'url' );
}
add_filter( 'login_headerurl', __NAMESPACE__ . '\\demunt_login_logo_url' );

function demunt_login_logo_url_title() {
  return 'De Haagse Munt';
}
add_filter( 'login_headertitle', __NAMESPACE__ . '\\demunt_login_logo_url_title' );


/**
 * Redirect user after successful login.
 *
 * @param string $redirect_to URL to redirect to.
 * @param string $request URL the user is coming from.
 * @param object $user Logged user's data.
 * @return string
 */
function demunt_login_redirect( $redirect_to, $request, $user ) {
	//is there a user to check?
	if ( isset( $user->roles ) && is_array( $user->roles ) ) {
		//check for admins
		if ( in_array( 'administrator', $user->roles ) ) {
			// redirect them to the default place
			return $redirect_to;
		} else {
			return '/dashboard';
		}
	} else {
		return $redirect_to;
	}
}
add_filter( 'login_redirect', __NAMESPACE__ . '\\demunt_login_redirect', 10, 3 );


/**
 * Hide admin bar by default
 */
add_filter('show_admin_bar', '__return_false');

/**
 *  Hide wp-admin for non-administrators
 */
function demunt_block_adminpages() {
  if ( is_admin() && ! current_user_can( 'administrator' ) &&
   ! ( defined( 'DOING_AJAX' ) && DOING_AJAX ) ) {
    wp_redirect( home_url() );
    exit;
  }
}
add_action('init', __NAMESPACE__ . '\\demunt_block_adminpages');


// Redefine user notification function
if ( !function_exists('wp_new_user_notification') ) {
    function wp_new_user_notification( $user_id, $plaintext_pass = '' ) {
        $user = new WP_User($user_id);

        $user_login = stripslashes($user->user_login);
        $user_email = stripslashes($user->user_email);

        $message  = sprintf(__('New user registration on your blog %s:'), get_option('blogname')) . "\r\n\r\n";
        $message .= sprintf(__('Username: %s'), $user_login) . "\r\n\r\n";
        $message .= sprintf(__('E-mail: %s'), $user_email) . "\r\n";

        @wp_mail(get_option('admin_email'), sprintf(__('[%s] New User Registration'), get_option('blogname')), $message);

        if ( empty($plaintext_pass) )
            return;

        $message  = __('Hi there,') . "\r\n\r\n";
        $message .= sprintf(__("Welcome to %s! Here's how to log in:"), get_option('blogname')) . "\r\n\r\n";
        $message .= wp_login_url() . "\r\n";
        $message .= sprintf(__('Username: %s'), $user_login) . "\r\n";
        $message .= sprintf(__('Password: %s'), $plaintext_pass) . "\r\n\r\n";
        $message .= sprintf(__('If you have any problems, please contact me at %s.'), get_option('admin_email')) . "\r\n\r\n";
        $message .= __('Adios!');

        wp_mail($user_email, sprintf(__('[%s] Your username and password'), get_option('blogname')), $message);

    }
}
