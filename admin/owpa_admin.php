<?php
/**
 * OBERON - WP Add-in
 * 
 * This file is part of the OBERON System and WordPress plugins made by Exalogic company and is released under the same license.
 * For more information please see oberon_hotel_reservation_plugin.php.
 * 
 * Copyright (c) 2007-2020 Mário Moravcik. All rights reserved.
 * 
 * Version: 1.1.1
 * Description:
 * Admin page handler.
 */

class OWPA_Admin {

    private $settings;

    // Property value get API url.
	public function get_oberon_web_url() {
		return $this->settings->oberon_web_url;
	}

	// Property value get API url.
	public function get_guest_checkin_success_url() {
		return $this->settings->guest_checkin_success_url;
	}

	// Wordpress base API path in rest controller.
	public function get_base_api_path(){
		return OWPA_RestController::CONST_REST_URL_BASE;
	}

    // Widget version.
    public function widget_version( $format = true ) {
		$ver = OBERONWPAddin::CONST_PLUGIN_VERSION;
		if ( $format ) {
			$ver = substr( number_format( $ver, 0, '', '.' ), 0, 3 );
		}
		return $ver;
	}



    // Create widget instance.
	public function __construct() {
		if ( ! defined( 'ABSPATH' ) ) {
			return;
        }
        
        add_action( 'admin_menu', array( $this, 'add_menu' ) ); // Menu items
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) ); // add admin scripts
        add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) ); // text domain
		add_filter( 'plugin_action_links', array( $this, 'add_settings_link' ), 10, 2 ); 
		
		//add_action( 'before_wp_oberon-reservation', array( $this, 'show_version_warning' ) );

		$this->load_settings();

    }
       

    
	/**
	 * Load widget settings.
	 */
	public function load_settings() {

		if( ! isset($this->settings) ) {
			$this->settings = new OWPA_Settings();	
		}
				
		$this->settings->load_settings();
	}

	/**
	 * Save widget setting.
	 */
	public function save_settings() {
		check_admin_referer( 'owpa-settings-save-order' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die('Access denied');
		}
		// $user = wp_get_current_user();
		// $allowed_roles = array( 'editor', 'administrator', 'author' );
		// if ( array_intersect( $allowed_roles, $user->roles ) ) {
		// 	return false;
		// }

		$this->load_settings();

		if ( isset( $_POST['owpa-settings-save'] ) ) {
			// We are saving.
			$url = sanitize_text_field( $_POST[$this->settings->controls->oberon_web_url->control_id] );
			if ( !$url ){ 
				$url = '';
			} else if ( substr( $url, 0, 4 ) !== "http" ) {
				$url = "http://" . $url;	
			}
			$this->settings->oberon_web_url = esc_url_raw( $url );
			
			// Redirect on success url
			$url = sanitize_text_field( $_POST[$this->settings->controls->guest_checkin_success_url->control_id] );
			if ( !$url ){ 
				$url = '';	
			} else if ( substr( $url, 0, 4 ) !== "http" ) {
				$url = "http://" . $url;	
			}
			$this->settings->guest_checkin_success_url = esc_url_raw( $url );


		} else {
			return false;
		}

		// Save the new settings.
		$this->settings->save_settings();
		
		$this->load_settings();
		return true;
	}
   
    // Load plugin text domain
    public function load_textdomain() {
        $locale = apply_filters( 'plugin_locale', get_locale(), OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN );
        load_plugin_textdomain( OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN, false, basename( dirname( __FILE__ ) ) . '/langs' );
	}

    // Load admin settings page.
    public function settings_page_handler() {		
        if ( ! defined( 'OWPA_ADMIN_PAGE' ) ) {
			define( 'OWPA_ADMIN_PAGE', true );
		}
        
        include_once( OWPA_PATH . 'admin/owpa_admin_settings_page.php' );

    }
    
    // Add admin menu links 
    public function add_menu() {
		//string $page_title, string $menu_title, string $capability, string $menu_slug, callable $function = '', int $position = null
		add_options_page( 'OBERON - WP Add-in', 'OBERON - WP Add-in', 'manage_options', 'owpa-settings', array( $this, 'settings_page_handler' ) );
    }
    
    // Add link to settings page
    public function add_settings_link( $links, $file ) {
		if ( current_user_can( 'manage_options' === $file ) ) {
			$settings_link = sprintf( '<a href="%s">%s</a>', 
									  admin_url( 'options-general.php?page=owpa-settings' ), 
									  __( 'Settings', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ) );
			array_unshift( $links, $settings_link );
		}

		return $links;
	}

    // Add scripts to admin
    function enqueue_scripts( $page ) {

		wp_enqueue_style( 'owpa-css-admin', OWPA_URL . 'admin/assets/owpa-admin.css', array(), '1.0' );
		wp_enqueue_script( 'owpa-application-base', OWPA_URL . 'assets/owpa-application-base.js', array( 'jquery' ), '1.0' );
		wp_enqueue_script( 'owpa-js-admin', OWPA_URL . 'admin/assets/owpa-admin.js', array( 'jquery' ), '1.0' );

	}
    
}
