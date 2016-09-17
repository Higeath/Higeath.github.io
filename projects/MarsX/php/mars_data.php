<?php
	class MaasApi {
    /**
     * Latest data URL.
     * @var string
     */
    var $latestUrl = "http://marsweather.ingenology.com/v1/latest/";
    /**
     * Archive data URL.
     * @var string
     */
    var $archiveUrl = "http://marsweather.ingenology.com/v1/archive/";
    /**
     * Raw JSON object with latest data.
     * @return string
     */
    public function getLatestRaw()
    {
        return file_get_contents($this->latestUrl);   
    }
    /**
     * Latest data as JSON
     * @return string
     */
    public function getLatestJson()
    {
        return json_encode($this->getLatest());
    }
    /**
     * Array of latest data.
     * @return array
     */
    public function getLatest()
    {
        $jsonData = file_get_contents($this->latestUrl);
        $this->report = json_decode($jsonData)->report;
        
		return $this->report;
    }
    /**
     * Raw JSON object with first page of archived data.
     * @return string
     */
    public function getArchiveRaw()
    {
        return file_get_contents($this->archiveUrl);
    }
    /**
     * JSON object of all archive data.
     * @return array
     */
    public function getArchiveJson()
    {
       return json_encode($this->getArchiveAll());
    }
    /**
     * Array of all archive data.
     * @return array
     */
    public function getArchiveAll()
    {
        $jsonData = file_get_contents($this->archiveUrl);
        $data = json_decode($jsonData);
        return $this->get($data);
    }
    
    public function getArchiveSearch($params)
    {
        /*
            Example $params:
            $params = array(
                "terrestrial_date_start"=>"2013-05-01",
                "terrestrial_date_end"=>"2013-05-10"
            );
         */
        $urlSuffix = "?";
        $count = count($params);
        foreach ($params as $key => $val) {
            $urlSuffix .= $key . "=" . urlencode($val);
            // Unless we're at the last param, add a & separator
            if ($count != 1) {
                $urlSuffix .="&";
            }
            $count--;
        }
        $jsonData = file_get_contents($this->archiveUrl . $urlSuffix);
        $data = json_decode($jsonData);
        return $this->get($data, substr($urlSuffix, 1));
    }
    /**
     * Uses first page results of archive query to gather all data from that query.
     * @param  object $data
     * @return array
     */
    public function get($data, $urlSuffix=NULL)
    {
        $results = $data->results;
        // Determine how many pages of data there are
        if ($data->count > 10) {
            $pages = ceil($data->count / 10);
        }
        // Context for ignoring HTTP / PHP errors with file_get_contents
        $context = stream_context_create(array(
            'http' => array('ignore_errors' => true),
        ));
        // Start at page 2 and go to the end
        for ($i=2;$i<=$pages;$i++) {
            $jsonData = file_get_contents($this->archiveUrl . "?page=" . $i . "&" . $urlSuffix, false, $context);
            // If $jsonData is an object add it's data to our results array.         
            if ($this->isJson($jsonData)) {
                foreach (json_decode($jsonData)->results as $result) {
                    array_push($results, $result);
                }
            }
        }
        return $results;
    }
    /**
     * Determines whether or not a string is a JSON object
     * Since this requires PHP 5.3, I'm assuming the JSON is OK
     * for any version below that.  Probably a better way of doing this
     * but I'll worry about that later.
     * @param  string  $string
     * @return boolean
     */
    private function isJson($string) {
        $version = substr(phpVersion(), 0, 3);
        if ($version >= "5.3") {
            json_decode($string);
            return (json_last_error() == JSON_ERROR_NONE);
        } 
        else {
            return true;
        }
    }
}



?>