<?php
/**
 * OBERON - WP Add-in
 * 
 * OWPA_Settings - settings class.
 * 
 * This file is part of the OBERON System and WordPress plugins made by Exalogic company and is released under the same license.
 * For more information please see owpa_plugin.php.
 * 
 * Copyright (c) 2007-2021 Mário Moravcik. All rights reserved.
 * 
 * Description: This class handles options and settings for the plugin.
 * Version: 1.1.1
 * 
 * Description:
 * Module handles plugin loading and saving of settings for all widgets of this plugin.
 */

class OWPA_Settings {

    const CONST_SERVICE_URL_NAME = 'service-url';
    const CONST_GUEST_CHECKIN_SUCCESS_URL = 'gchi-success-url';

    private $options = array();
    // Control settings used in admin pages
    public $controls = array();


    // --- PUBLIC PROPERTIES ---//
    public $version;
    public $oberon_web_url;
    public $guest_checkin_success_url;
    
    
    /**
	 * Initialize settings class.
	 */
	public function __construct() {

        if ( is_admin() ) { // In admin we load control settings.
            $this->set_controls();
        }

        // Set defaults
        $this->set_defaults();

	}

    /**
     * Load settings from wordpress.
     */
    public function load_settings() {

        if ( empty( $this->options ) ) {
			// load if empty.		
			$this->options = get_option( OBERONWPAddin::CONST_PLUGIN_OPTION_NAME, $this->get_default_plugin_settings() );
		}

		// load defaults if the options don't exist...
		if ( empty( $this->options ) ) {
			$this->options = $this->get_default_plugin_settings();
		}
        
        if( ! $this->oberon_web_url ) {
            $this->set_defaults();   
        }

        // Load version setting.
        $this->version = get_option( OBERONWPAddin::CONST_PLUGIN_OPTION_VERSION, 1 ); //stored version for later updates.

        // Load option settings.
        if ( array_key_exists( OWPA_Settings::CONST_SERVICE_URL_NAME, $this->options ) ) {
			$this->oberon_web_url = untrailingslashit( $this->options[ OWPA_Settings::CONST_SERVICE_URL_NAME ] );
		}
        
        if ( array_key_exists( OWPA_Settings::CONST_GUEST_CHECKIN_SUCCESS_URL, $this->options ) ) {
            $this->guest_checkin_success_url = untrailingslashit( $this->options[ OWPA_Settings::CONST_GUEST_CHECKIN_SUCCESS_URL ] );
        }
        

        return true;
    }

    /**
     * Save settings to wordpress.
     */
    public function save_settings() {

        $defaults = $this->get_default_plugin_settings();
		$this->options = array();   

        // Create settings object.
        $this->options[ OWPA_Settings::CONST_SERVICE_URL_NAME ] = $this->oberon_web_url;        	

        $this->options[ OWPA_Settings::CONST_GUEST_CHECKIN_SUCCESS_URL ] = $this->guest_checkin_success_url;


        // Save the new options.
        update_option( OBERONWPAddin::CONST_PLUGIN_OPTION_NAME, $this->options );
        
        $this->options = array();
        $this->load_settings(); // Load updated settings

        return true;
    }


    /**
     *  Set default values for setting properties.
     */
    private function set_defaults() {
        
        $this->version = 1;
        $this->oberon_web_url = '';
        $this->guest_checkin_success_url = '';

    }

    /** 
     * Create control list for settings in admin pages.
     */
    private function set_controls() {
        // control_types = 'text', 'dropdownlist', 'dropdown', 'multiline'

        $this->controls = (object) array(
			'oberon_web_url' => (object) array(
                'control_id' =>     'oberon-web-url',
                'control_type' =>   'text',
				'value_type' =>     'text/url',
            ),
            'guest_checkin_success_url' => (object) array(
                'control_id' =>     'gchi-success-url',
                'control_type' =>   'text',
				'value_type' =>     'text/url',
			),
		);

    }

    /*
     * Generate HTML control for admin page.
     * 
	 * @param string $controlObj        Control object see "set_controls" method.
     * @param string $value             Value of the control. It will be sanitized by "value_type".
     * @param string $text              Text description of the control. Text should be put in via '__(text, textdomain)' method.
     * @param string $buttonId          If the controls needs aditional button this is the ID of the button control.
     * @param string $buttonText        Button text. Text should be put in via '__(text, textdomain)' method.
     * @param string $buttonDisabled    Sets the button as disabled by css class "disabled".
     */
    public function create_control($controlObj, 
                                  $text,
                                  $value, 
                                  $buttonId = '', 
                                  $buttonText = '', 
                                  $buttonDisabled = true) {

        if( ! $controlObj || is_null($controlObj) ) { return ''; }
        if( ! $controlObj->control_id || strlen($controlObj->control_id) == 0 ) { return ''; }
        $sValue = '';
        $html = '';

        // Sanitize values by type
        if ($controlObj->value_type == 'text/url' ) {
            $sValue = esc_url( $value );
        }         

        // Control type
        if ( $controlObj->control_type == 'dropdownlist') { // Must select only from dropdown list value.

        } else if ( $controlObj->control_type == 'dropdown') { // Textbox with dropdown suggestions.

        } else if ( $controlObj->control_type == 'multiline') { // Multiline text field.

        } else { // Single line textbox

            $html = '<div class="control">';
            $html .= '  <label for="' .esc_attr( $controlObj->control_id ). '">' .$text. ':</label>';
            $html .= '  <input type="text" id="' .esc_attr( $controlObj->control_id ). '" name="' .esc_attr( $controlObj->control_id ). '" value="' .$sValue. '" />';

            if ( strlen($buttonId) != 0 ) {
                // Add button
                $html .= '  <input class="button-primary button-large '. esc_attr($buttonId); 
                if ( $buttonDisabled ) { $html .= ' disabled'; }
                $html .= '" type="button" id="' .esc_attr($buttonId). '" name="' .esc_attr($buttonId). '" value="';            
                if ( strlen($buttonText) != 0 ) {
                    $html .= $buttonText;
                } else {
                    $html .= '...';
                }
                $html .= '" />';
            }        
            $html .= '</div>';
        }


        return $html;
    }


    /** 
     * Get default plugin settings object as from wordpress.
     */
	function get_default_plugin_settings() {
		return array(
            OWPA_Settings::CONST_SERVICE_URL_NAME => '',
            OWPA_Settings::CONST_GUEST_CHECKIN_SUCCESS_URL => '',
		);
	}

}