<?php
/**
 * OBERON - WP Add-in
 * 
 * OWPA_CheckInWidget - Widget class.
 * 
 * This file is part of the OBERON System and WordPress plugins made by Exalogic company and is released under the same license.
 * For more information please see owpa_plugin.php.
 * 
 * Copyright (c) 2007-2020 Mário Moravcik. All rights reserved.
 * 
 * Version: 1.1.1
 * 
 * Description:
 * Widget module for guest online pre check-in. Link to page with this widget can be sent to hotel guest to make the procedure of
 * accommodating at the facility faster. The guest can fill the form with his personal data before he arrives at the accommodation facility.
 * When he arrives the reception clerk or automatic system have to check the validity of given data without the need to manualy enter.
 * This makes the process of accommodating much faster or even totaly without the clerc depends on the installed system.
 * 
 */

class OWPA_CheckInWidget extends WP_Widget {

	const CONST_SHORTCODE_GUESTCHECKIN = 'owpa_guestcheckin';


	private $settings;



	/**
	 *  Initialize new instance of widget class.
	 */
	public function __construct() {

		// 
		$widget_ops = array(
			'description' 	=> __( 'On-line form for guests to pre-fill of personal data required for check-in.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ),
		);
		parent::__construct('OWPA_CheckInWidget', // Base ID
							$name = 'Guest pre check-in', 
							$args = $widget_ops );	

		$this->load_settings();
	}

	/**
	 * Load settings.
	 */
	private function load_settings() {
		if( ! isset($this->settings) ) {
			$this->settings = new OWPA_Settings();	
		}				
		$this->settings->load_settings();				
	}

	/**
	 * Shared method for this widgets shortcode registering, used by main plugin class.
	 */
	public static function register_widget_full($handlerFunctionName) {
		
		register_widget( 'OWPA_CheckInWidget' ); // Must be the same as BaseID in widget.

		add_shortcode( OWPA_CheckInWidget::CONST_SHORTCODE_GUESTCHECKIN, $handlerFunctionName );

    }

	/**
	 * Shared method for resolving of class used for handling of shortcode call.
	 */
	public static function shortcodes_get_baseid($shortcodeTag) {
		
		if ($shortcodeTag == OWPA_CheckInWidget::CONST_SHORTCODE_GUESTCHECKIN ) {
			return 'OWPA_CheckInWidget';
		}

		return '';
    }


	/**
	 * Front-end display of widget.
	 *
	 * @param array $args .
	 * @param array $instance .
	 */
	function widget( $args, $instance ) {
		
		/*
			Widget rendered on page is translated via javascript. It is posible to download also translation files from OBERON.
			That's why here is no translation in html.
		*/
		$this->widget_scripts();
		$this->generate_front_end_html();

	}


	/**
	 * Back-end form for widget area.
	 *
	 * @param array $instance Previously saved values from database.
	 */
	function form( $instance ) {

		//$restype = $this->validate_reservation_type( $instance['reservation_type'] );
		
		echo '<div>';
		echo '  <p class="description" style="padding-top: 1em;">';
		echo __( 'OBERON Web service connector version', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ) . ': ' . $this->settings->version;

		echo '  <br />';

		if ( ! $this->settings->oberon_web_url || empty( $this->settings->oberon_web_url ) ) {
			echo __( 'Before using this plugin, the OBERON Web service url have to set in the plugin settings.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN );
			echo '&nbsp;';
			echo $this->my_settings_link( __( 'settings page', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ) );
		} else {
			echo __( 'Web service url', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN );
			echo ':&nbsp;&nbsp;' . esc_url( $this->settings->oberon_web_url );		
		}
		echo '</p></div>';
	}

	/**
	 * Display of widget with shortcode 'oberon_plugins_guestcheckin'.
	 *
	 * @param array $atts Attributes in short code.
	 */
	public function widget_shortcode( $atts ) {

		global $wp_widget_factory;

		$this->widget_scripts();
		$this->generate_front_end_html();

	}

	
    /**
	 * Register admin scripts and styles.
	 */
	function widget_scripts() {
        
        wp_enqueue_style( 'owpa-guestcheckin-styles', OWPA_URL . 'assets/owpa-prod.css', array(), '1.0' );

		wp_enqueue_script( 'owpa-lingua-plugin', OWPA_URL . 'assets/jquery.lingua.min.js', array( 'jquery' ), '1.0', true );
		wp_enqueue_script( 'owpa-application-base', OWPA_URL . 'assets/owpa-application-base.js', array( 'jquery' ), '1.0', true );
		wp_enqueue_script( 'owpa-guestcheckin-script', OWPA_URL . 'assets/owpa-guestcheckin-script.js', array( 'jquery' ), '1.0', true );

    }

	/**
	 *  Generate widget html code.
	 */
	function generate_front_end_html() {
?>

<div class="oberonbs" id="<?php echo $this->id; ?>">
	<div class="content-body">			
		<div class="online-checkin-content">
			<div class="reservation">
				<div class="container">
					<div class="row">
						<div class="col-10 title"><h4 class="reservationTitle">Rezervácia</h4><h3 class="reservationName"></h3></div>
						<div class="col-2 btn-right">
							<button class="btn btn-flat btnReservationToggle" type="button"></button>
						</div>
					</div>
            		<div class="row form-inline reservation-items" style="display: none;">
						<div class="col-md-6 col-lg-6">
							<div class="form-group itm-owpaDateArrival">
								<label class="col-sm-6 col-form-label">Dátum príchodu:</label>
								<div class="col-sm-6">
									<input type="text" readonly class="form-control-plaintext" id="owpaDateArrival" value="" />
								</div>
							</div>
						</div>
						<div class="col-md-6 col-lg-6">
							<div class="form-group itm-owpaDateDeparture">
								<label class="col-sm-6 col-form-label">Dátum odchodu:</label>
								<div class="col-sm-6">
									<input type="text" readonly class="form-control-plaintext" id="owpaDateDeparture" value="" />
								</div>
							</div>
						</div>
						<div class="col-md-6 col-lg-6">
							<div class="form-group itm-owpaNigthCount">
								<label class="col-sm-6 col-form-label">Počet nocí:</label>
								<div class="col-sm-6">
									<input type="text" readonly class="form-control-plaintext" id="owpaNigthCount" value="" />
								</div>
							</div>
						</div>
						<div class="col-md-4 col-lg-6">
							<div class="form-group itm-owpaPersons">
								<label class="col-sm-6 col-form-label">Osoby:</label>
								<div class="col-sm-6">
									<input type="text" readonly class="form-control-plaintext" id="owpaPersons" value="" />
								</div>
							</div>
						</div>
						<div class="col-md-12 col-lg-12">
							<div class="form-group itm-owpaReservationState">
								<label class="col-sm-6 col-form-label">Stav rezervácie:</label>
								<div class="col-sm-6">
									<input type="text" readonly class="form-control-plaintext" id="owpaReservationState" value="" />
								</div>
							</div>
						</div>
						<div class="col-12"><div class="spacer-1"></div></div>						
					</div>
				</div>						
				<div class="owpa-error-panel" style="display: none;">
					<div class="owpa-error-icon"></div>
					<div class="owpa-error-message"></div>
				</div>
			</div>
			<div class="owpa-guests">
			</div>
		</div>	
		<div class="container owpa-buttons" style="display: none;">
			<div class="row">
				<div class="form-group col-md-6 col-lg-9"></div>
				<div class="form-group col-md-6 col-lg-3">
					<button type="submit" id="owpa-submit-checkin" class="btn secondary buttons owpa-submit-checkin">Odoslať</button>
				</div>	
			</div>
		</div>		
	</div>
	<div class="owpa-modal modal" style="display: none;">
		<div class="owpa-modal-backdrop"></div>
		<div class="owpa-modal-dialog">
			<div class="owpa-modal-content">
				<div class="owpa-modal-header">
					<div class="owpa-modal-title"></div>
					<!-- owpa-button-close -->
				</div>
				<div class="owpa-modal-body">
					<div class="owpa-modal-icon"></div>
					<div class="owpa-modal-message"></div>
				</div>
				<div class="owpa-modal-buttons">
					<div class="owpa-modal-ok" style="display: block">
						<button class="btn owpa-button-ok">OK</button>
					</div>
					<div class="owpa-modal-close" style="display: block">
						<button class="btn owpa-button-close">Close</button>
					</div>
				</div>
			</div>
		</div>		
	</div>		
</div>

<script type="text/javascript">

(function() {


	window.guestCheckInWidget = {
		lingua: '<?php echo esc_url( OWPA_URL ); ?>langs/',
		lang: 'sk',
		restUrl: '<?php echo OWPA_RestController::restUrlBase() ?>',
		guid: '',
		successRedirect: '<?php echo esc_url( $this->settings->guest_checkin_success_url ); ?>',
	};

	<?php
	if (isset($_GET['a'])) {
		?>window.guestCheckInWidget.guid = '<?php echo esc_js($_GET['a']); ?>';<?php
	} else if (isset($_GET['guid'])) {
		?>window.guestCheckInWidget.guid = '<?php echo esc_js($_GET['guid']); ?>';<?php
	}
	if (isset($_GET['lang'])) {
		?>window.guestCheckInWidget.lang = '<?php echo esc_js($_GET['lang']); ?>';<?php
	}
	?>	
	if (!window.guestCheckInWidget.guid || window.guestCheckInWidget.guid.length == 0) {
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == 'a' || sParameterName[0] == 'guid') {
				window.guestCheckInWidget.guid = sParameterName[1];
			} else if (sParameterName[0] == 'lng' || sParameterName[0] == 'lang') {
				window.guestCheckInWidget.lang = sParameterName[1];
			}
		}	
	}

	
})();

</script>
	<?php
	}
}

?>
