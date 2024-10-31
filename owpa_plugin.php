<?php
/**
 * Plugin Name: OBERON - WP Add-in
 * Plugin URI: https://exalogic.sk/na-stiahnutie-oberon/zasuvny-modul-pre-wordpress/
 * Text Domain: oberon-wpaddin
 * Domain Path: /languages
 * Description: Wordpress plugin collection for connection to OBERON Company agenda background web services API.
 * Version: 1.1.1
 * Author: Mário Moravčík, Exalogic, s.r.o.
 * Author URI: http://exalogic.sk
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html  
 */

if ( ! function_exists( 'add_action' ) ) {
	wp_die( 'You are trying to access this file in a manner not allowed.', 'Direct Access Forbidden', array( 'response' => '403' ) );
}



// Main Constant definitions.
if ( ! defined( 'OWPA_TEXT_DOMAIN' ) ) {
	define( 'OWPA_TEXT_DOMAIN', 'oberon-wpaddin' ); // Must have the same name as permalink
}
define( 'OWPA_URL', plugin_dir_url( __FILE__ ) );
define( 'OWPA_PATH', plugin_dir_path( __FILE__ ) );


// Include base plugin files
require_once dirname( __FILE__ ) . '/owpa_restcontroller.php';
require_once dirname( __FILE__ ) . '/owpa_settings.php';

// Includes for all widgets available in this plugin.
require_once dirname( __FILE__ ) . '/widgets/owpa_check_in_widget.php';


if ( ! class_exists( 'OBERONWPAddin' ) ) :

/**
 * OWPA - OBERON WP Add-in
 */
class OBERONWPAddin {

    const CONST_PLUGIN_VERSION = 1110;
    const CONST_PLUGIN_WP_VERSION = '5.5';

    const CONST_PLUGIN_TEXT_DOMAIN = 'oberon-wpaddin';
    const CONST_PLUGIN_OPTION_NAME = 'owpa_settings';
    const CONST_PLUGIN_OPTION_VERSION = 'owpa_version';
   
    /**
     * Create instance of plugin.
     */
    public function __construct() {
        
        if ( is_admin() ) { 
            // Administrator
            include_once( plugin_dir_path( __FILE__ ) . 'admin/owpa_admin.php' );        
            $oberon_plugins_admin = new OWPA_Admin();
        }

        // Call to register REST API
        add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
        // Call action to register plugin widgets.
        add_action( 'widgets_init', array( $this, 'register_widgets' ) );

    }

    /**
     *  Register JSON REST APIs.
     */
	function register_rest_api() {
        
		$restController = new OWPA_RestController();
		$restController->register_routes();

	}

    /**
     *  Register all widgets and modules this plugin includes.
     */
	function register_widgets() {

        //Guest check in widget       
        OWPA_CheckInWidget::register_widget_full('owpa_widget_shortcode_handler');

	}
    

}

new OBERONWPAddin;
endif;


/**
 * Shortcode handler for all registered widgets in plugin.
 *
 * @param array $atts Shortcode attributes.
 * @param array $content Content between shortcode tags.
 * @param array $tag  Shortcode tag name.
 */
function owpa_widget_shortcode_handler( $atts, $content = null, $tag ) {

    global $wp_widget_factory;
    $widget_class_name = '';

    // -----------------------------------------------------------------------------------------------------------------
    // All supported handlers of shortcodes should be added here to resolve widget which will be used for particular tag.
    // -----------------------------------------------------------------------------------------------------------------
    if ( ! $widget_class_name ) {
        // Guest checkin widget
        $widget_class_name = OWPA_CheckInWidget::shortcodes_get_baseid($tag);
    }
    
    // other 


    if ( ! $widget_class_name ) {
        // The shortcode was registered to this method
        return '<p>' . sprintf( __( "%s: The widget for shortcode tag '" . $tag . "' was not resolved. The shortcode either is not supported or there could be an error in plugin.", OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ),'<strong>' . $class . '</strong>' ) . '</p>';
    }
    if ( ! is_a( $wp_widget_factory->widgets[ $widget_class_name ], 'WP_Widget' ) ) {
        $wp_class = 'WP_Widget_' . ucwords( strtolower( $class ) );
        if ( ! is_a( $wp_widget_factory->widgets[ $wp_class ], 'WP_Widget' ) ) {
            return '<p>' . sprintf( __( "%s: Widget class not found. Make sure this widget exists and the class name is correct.", OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ),'<strong>' . $class . '</strong>' ) . '</p>';
        } else {
            $class = $wp_class;
        }
    }

    ob_start();
    the_widget( $widget_class_name, $atts, array(
        'widget_id' => $tag,
        'before_widget' => '',
        'after_widget' => '',
        'before_title' => '',
        'after_title' => '',
        'content' => $content,
        'tag' => $tag,
    ));
    $output = ob_get_contents();
    ob_end_clean();
    return $output;

}

