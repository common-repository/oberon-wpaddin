<?php
/**
 * OBERON - WP Add-in
 * 
 * This file is part of the OBERON System and WordPress plugins made by Exalogic company and is released under the same license.
 * For more information please see owpa_plugin.php.
 * 
 * Copyright (c) 2007-2021 Mário Moravcik. All rights reserved.
 * 
 * Version: 1.1.1
 * 
 * Description:
 * Rest API methods as communication link between OBERON API and web page.
 */

class OWPA_RestController extends WP_REST_Controller {
  

    const CONST_REST_VERSION = '1';
    const CONST_REST_URL_BASE = 'owpaapi';

	private $settings;


	/**
	 * Here initialize our namespace and resource name.
	 */
	public function __construct() {
		
		$this->namespace = '/' . OWPA_RestController::CONST_REST_URL_BASE;		
		$this->load_settings();

	}

	/**
	 * This API base url without method name.
	 */
	public static function restUrlBase() {
		return OWPA_RestController::CONST_REST_URL_BASE . '/v'	. OWPA_RestController::CONST_REST_VERSION;
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
	 * Get base oberon url.
	 */
	private function get_oberon_web_url() {
		return $this->settings->oberon_web_url;
	}

	
	/**
	 * Get base route.
	 */
	private function get_base_route() {
		return  '/v'  . OWPA_RestController::CONST_REST_VERSION;		
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {

		register_rest_route( $this->namespace, $this->get_base_route() . '/version' , array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_version' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( $this->namespace, $this->get_base_route() . '/ping' , array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_ping' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( $this->namespace, $this->get_base_route() . '/GetCountryList' , array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_country_list' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => array(),
			),
		) );


		register_rest_route( $this->namespace, $this->get_base_route() . '/GetHotel_RoomReservation' , array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'get_hotel_roomtreservation' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => array(),
			),
		) );

		register_rest_route( $this->namespace, $this->get_base_route() . '/SetHotel_Guests' , array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'set_hotel_guests' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => array(),
			),
		) );

	}


	/*
	--------------------------------------------------------------------
	---  MTHODS FOR OBERON Web API COMMUNICATION. ---
	--------------------------------------------------------------------
	*/
	

	/**
	 * Test server availability, ping request returns IP address of server where the wordpress page runs.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_ping( $request ) {

		$url = $this->get_oberon_web_url() . '/ping';
		$args = '';

		$response = wp_remote_get( $url, $args );

		$data = $this->get_exc_default();
		$body = wp_remote_retrieve_body( $response );
		
		if( ! $response || ! $body ) {
			$data[ 'result' ] = false;
			$data[ 'data' ] = 'Hotel web service not responding.';
		} else {
			$data[ 'result' ] = true;
			$data[ 'data' ] = $body;
		}		
		return new WP_REST_Response( $data, 200 );
	}


	/**
	 * Get version of oberon web service API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_version( $request ) {
		$user_data = '';
		$url = $this->get_oberon_web_url() . '/GetVersion';
		$myex = $this->get_text( $url );

		$data = $this->get_exc_default();
		$body = wp_remote_retrieve_body( $myex );
		
		if( ! $myex || ! $body ) {
			$data[ 'result' ] = false;
			$data[ 'data' ] = 'OBERON Center API not responding.';
		} else {
			$data[ 'result' ] = true;
			$data[ 'data' ] = $body;
		}

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * Get a list of countries from API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_country_list( $request ) {
		$url = $this->get_oberon_web_url() . '/GetCountryList';		
		$args = '';
		$myex = $this->get_data( $url );		
		$response = new WP_REST_Response( $myex, 200 );

		return $response;
	}

	/**
	 * Load reservation data from API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_hotel_roomtreservation( $request ) {

		$myex = $this->get_exc_default();

		$url = $this->get_oberon_web_url() . '/GetHotel_RoomReservation';
		$body = $request->get_body();
		$args = array(
			'headers'   => array( 'Content-Type' => 'application/json; charset=utf-8' ),
			'body'      => $body,  //json_encode( $array_with_parameters ),
			'method'    => 'POST',
		);
		$myex = $this->post_data( $url, $args );				
		$response = new WP_REST_Response( $myex, 200 );

		return $response;

	}


	/**
	 * Update guests in back end system OBERON Web API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function set_hotel_guests( $request ) {
		$myex = $this->get_exc_default();

		$url = $this->get_oberon_web_url() . '/SetHotel_Guests';
		$body = $request->get_body();

		$args = array(
			'headers'   => array( 'Content-Type' => 'application/json; charset=utf-8' ),
			'body'      => $body,  //json_encode( $array_with_parameters ),
			'method'    => 'POST',
		);

		$response = $this->post_data( $url, $args );

		$headers = wp_remote_retrieve_headers( $response );
		$user_data = $headers['userData'];

		$response = new WP_REST_Response( $response, 200 );
		$response->header( 'userData', $user_data );

		return $response;
	}

	
	/* ----------  PERMISSIONS  ---------- */

	/**
	 * Check if a given request has access to get items
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|bool
	 */
	public function get_items_permissions_check( $request ) {
		//return true; <--use to make readable by all
		return true; //current_user_can( 'install_plugins' );
	}

	/**
	 * Check if a given request has access to get items
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|bool
	 */
	public function get_admin_permissions_check( $request ) {
		//if ( is_admin() ) {
			return true; //current_user_can( 'install_plugins' );
		//} else {
		//	return false;
		//}			
	}


	/* ----------  DATA PREPARATION  ---------- */

	/**
	 * Prepare the item for the REST response
	 *
	 * @param mixed $item WordPress representation of the item.
	 * @param WP_REST_Request $request Request object.
	 * @return mixed
	 */
	public function prepare_item_for_response( $item, $request ) {
		return array();
	}

	/* ----------  PERMISSIONS  ---------- */

	/**
	 * Get the query params for collections
	 *
	 * @return array
	 */
	public function get_collection_params() {
		return array(
			'page'     => array(
				'description'        => 'Current page of the collection.',
				'type'               => 'integer',
				'default'            => 1,
				'sanitize_callback'  => 'absint',
			),
			'per_page' => array(
				'description'        => 'Maximum number of items to be returned in result set.',
				'type'               => 'integer',
				'default'            => 10,
				'sanitize_callback'  => 'absint',
			),
			'search'   => array(
				'description'        => 'Limit results to those matching a string.',
				'type'               => 'string',
				'sanitize_callback'  => 'sanitize_text_field',
			),
		);
	}


	/* ----------  OBJECTS  ---------- */

	/**
	 * Post data to web service.
	 *
	 * @param string $url .
	 *
	 * @param string $args .
	 */
	private function post_data( $url, $args ) {
		$exc = $this->get_exc_default();

		$response = wp_remote_post( $url, $args );

		if ( is_wp_error( $response ) ) {
			$code = wp_remote_retrieve_response_code( $response );
			$errmsg = wp_remote_retrieve_response_message( $response );
			$exc = $this->get_exc( $code, $errmsg, null );
			return $exc;
		}

		$myex = $this->get_dataresult( $response );

		return $myex;
	}

	/**
	 * Get data from web service.
	 *
	 * @param string $url .
	 */
	private function get_data( $url ) {
		$exc = $this->get_exc_default();
		$args = '';
		$response = wp_remote_get( $url, $args );
		if ( is_wp_error( $response ) ) {

			$code = wp_remote_retrieve_response_code( $response );
			$errmsg = wp_remote_retrieve_response_message( $response );

			$exc = $this->get_exc( $code, $errmsg, null );
			return $exc;
		}

		$myex = $this->get_dataresult( $response );

		return $myex;
	}

	/**
	 * Get data from web service.
	 *
	 * @param string $url .
	 */
	private function get_text( $url ) {		
		$args = array(
			'headers'   => array( 'Content-Type' => 'text/html; charset=utf-8' ),
			'method'    => 'GET',
		);
		$response = wp_remote_get( $url, $args );
		if ( is_wp_error( $response ) ) {
			$code = $response->get_error_code();
			$errmsg = $response->get_error_message();
			if(strpos($errmsg, 'Failed to connect') !== 0) {
				$errmsg = 'Failed to connect to OBERON Center API.';
				$apiurl = $this->get_oberon_web_url();
				if(!$apiurl || strlen($apiurl) == 0) {
					$apiurl = $apiurl . ' OBERON Center API url is not set.';
				} else {
					$apiurl = $apiurl . ' Check the OBERON Center API accessibility and state.';	
				}
			}

			$exc = $this->get_exc( $code, $errmsg, null );
			return $exc;
		}

		$myex =  $response;

		return $myex;
	}


	/**
	 * Default exception.
	 */
	private function get_exc_default() {
		return array(
			'result'        => false,
			'errNumber'     => 0,
			'description'   => '',
			'data'          => array(),
		);
	}

	/**
	 * Default exception.
	 *
	 * @param int    $err_number  Error number.
	 *
	 * @param string $description Error message.
	 *
	 * @param array  $data        Response data.
	 */
	private function get_exc( $err_number, $description, $data ) {
		$res = array(
			'result'        => false,
			'errNumber'     => $err_number,
			'description'   => $description,
			'data'          => array(),
		);
		if ( $data && ! empty( $data ) ) {
			$res['data'] = $data;
		}
		return $res;
	}

	/**
	 * Get data result from OBEORN.
	 *
	 * @param object $response .
	 */
	private function get_dataresult( $response ) {
		$myex = $this->get_exc_default();

		$data = wp_remote_retrieve_body( $response );

		if ( empty( $data ) ) {
			$myex['result'] = false;
			$myex['errNumber'] = 99;
			$myex['description'] = 'Response error';
			return $myex;
		}

		$data = json_decode( $data );

		$myex['result'] = $data->result;
		$myex['errNumber'] = $data->errNumber;
		$myex['description'] = $data->description;
		$myex['data'] = $data->data;

		return $myex;
	}

	/**
	 * Handle web service response error by status codes.
	 *
	 * @param int $code Response code.
	 */
	private function handle_response_error( $code, $errmsg ) {
		$exc = $this->get_exc_default();
		if ( 200 === $code) { // OK
			$exc['result'] = true;
		} else if ( 0 === $code ) {
			$exc = $this->get_exc( 111, 'The web service server in unavailable.', null );
		} else if ( 404 === $code) {
			$exc = $this->get_exc( 404, 'Web service method not resolved.', null );
		} else if ( 401 === $code) {
			$exc = $this->get_exc( 401, 'User not logged in.', null );
		} else if ( 500 === $code) {
			$exc = $this->get_exc( 500, 'Internal web service server error.', null );
		// } else if (exception === 'parsererror') {
		// 	$exc = $this->get_exc( 900, 'Chyba pre spracovaní JSON dát zo servera.');
		// } else if (exception === 'timeout') {
		// 	$exc = $this->get_exc( 901, 'Čas pre spracovanie požiadavky vypršal.' );
		// } else if (exception === 'abort') {
		// 	$exc = $this->get_exc( 902, 'Asynchrónne volanie bolo prerušené.' );
		} else {
			$exc = $this->get_exc( $code, $errmsg, null );
		}
		return exc;
	}

}
