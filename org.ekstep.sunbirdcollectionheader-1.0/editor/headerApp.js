angular.module('org.ekstep.sunbirdcollectionheader:app', ["Scope.safeApply", "yaru22.angular-timeago"]).controller('headerController', ['$scope', function($scope) {

    var plugin = { id: "org.ekstep.sunbirdcollectionheader", ver: "1.0" };
    $scope.contentDetails.contentImage = ecEditor.getConfig('headerLogo') || ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/images/sunbird_logo.png");
    $scope.internetStatusObj = {
        'status': navigator.onLine,
        'text': 'No Internet Connection!'
    };
    $scope.disableSaveBtn = true;  
    $scope.disableReviewBtn = false;  
    $scope.lastSaved;
    $scope.alertOnUnload = ecEditor.getConfig('alertOnUnload');
    $scope.pendingChanges = false;
    $scope.hideReviewBtn = false;
    $scope.publishMode = ecEditor.getConfig('editorConfig').publishMode || false;
    $scope.isFalgReviewer = ecEditor.getConfig('editorConfig').isFalgReviewer || false;

    $scope.saveContent = function() {
        $scope.disableSaveBtn = true;
        ecEditor.dispatchEvent("org.ekstep.contenteditor:save", {
            showNotification: true,
            callback: function(err, res) {
                if (res && res.data && res.data.responseCode == "OK") {
                    $scope.lastSaved = Date.now();
                    $scope.pendingChanges = false;
                    $scope.disableReviewBtn = false;
                    $scope.sendForeReviewBtnFn();
                } else {
                    $scope.disableSaveBtn = false;
                    $scope.disableReviewBtn = true;
                }
                $scope.$safeApply();
            }
        });
    };

    $scope.editContentMeta = function() {
        ecEditor.dispatchEvent("org.ekstep.editcontentmeta:showpopup");
    }

    $scope.sendForReview = function(){
        $scope.disableReviewBtn = true;
        var meta = ecEditor.getService(ServiceConstants.CONTENT_SERVICE).getContentMeta(ecEditor.getContext('contentId'));
        if (meta.status === "Draft") {
            ecEditor.dispatchEvent("org.ekstep.editcontentmeta:showpopup", { review: true });
            $scope.disableReviewBtn = false;
        } else {
            ecEditor.dispatchEvent("org.ekstep.contenteditor:review", {
                callback: function(err, res) {                
                    if(err){
                        $scope.disableReviewBtn = false;
                    }
                    $scope.$safeApply();               
                }
            });
        }
    };

    $scope.publishContent = function(){
        ecEditor.dispatchEvent("org.ekstep.contenteditor:publish", {
            callback: function(err, res) {
                if(!err)
                    window.parent.$('#' + ecEditor.getConfig('modalId')).iziModal('close');
            }
        });
    };

    $scope.rejectContent = function(){
        ecEditor.dispatchEvent("org.ekstep.contenteditor:reject", {
            callback: function(err, res) {
                if(!err)
                    window.parent.$('#' + ecEditor.getConfig('modalId')).iziModal('close');
            }
        });
    };

    $scope.acceptContentFlag = function(){
        ecEditor.dispatchEvent("org.ekstep.contenteditor:acceptFlag", {
            callback: function(err, res) {
                if(!err)
                    window.parent.$('#' + ecEditor.getConfig('modalId')).iziModal('close');
            }
        });
    };

    $scope.discardContentFlag = function(){
        ecEditor.dispatchEvent("org.ekstep.contenteditor:discardFlag", {
            callback: function(err, res) {
                if(!err)
                    window.parent.$('#' + ecEditor.getConfig('modalId')).iziModal('close');
            }
        });
    };

    $scope.retireContent = function(){
        ecEditor.dispatchEvent("org.ekstep.contenteditor:retire", {
            callback: function(err, res) {
                if(!err)
                    window.parent.$('#' + ecEditor.getConfig('modalId')).iziModal('close');
            }
        });
    };

    $scope.onNodeEvent = function(event, data) {
        $scope.pendingChanges = true;
        $scope.disableSaveBtn = false;
        $scope.disableReviewBtn = true;
        $scope.$safeApply();                
    };

    $scope.showNoContent = function() {
        $scope.closeEditor();
    };

    $scope.closeEditor = function() {
        if ($scope.alertOnUnload === true && $scope.pendingChanges === true) {
            if (window.confirm("You have unsaved changes! Do you want to leave?")) {
                window.parent.$('#' + ecEditor.getConfig('modalId')).iziModal('close');
            }
        } else {
            window.parent.$('#' + ecEditor.getConfig('modalId')).iziModal('close');
        }
    }

    $scope.telemetry = function(data) {
        org.ekstep.services.telemetryService.interact({ "type": 'click', "subtype": data.subtype, "target": data.target, "pluginid": plugin.id, "pluginver": plugin.ver, "objectid": ecEditor.getCurrentStage().id, "stage": ecEditor.getCurrentStage().id });
    };

    $scope.internetStatusFn = function(event) {
        $scope.$safeApply(function() {
            $scope.internetStatusObj.status = navigator.onLine;
        });
    };

    $scope.sendForeReviewBtnFn = function() {
        var nodeData = ecEditor.jQuery("#collection-tree").fancytree("getRootNode").getFirstChild();
        $scope.disableReviewBtn = (!nodeData.children) ? true : false;
        $scope.$safeApply(); 
    };

    $scope.getContentMetadata = function(){
        var rootNode = org.ekstep.services.collectionService.getNodeById(ecEditor.getContext('contentId'));        
        var status = rootNode.data.metadata.status;
        $scope.hideReviewBtn = (status === 'Draft' || status === 'FlagDraft' ) ? false : true;
        $scope.sendForeReviewBtnFn();
        $scope.$safeApply();  
    };

    $scope.updateTitle = function(event,data){
        $scope.contentDetails.contentTitle = data;
        document.title = data;
        $scope.$safeApply(); 
    };
    
    window.addEventListener('online', $scope.internetStatusFn, false);
    window.addEventListener('offline', $scope.internetStatusFn, false);
    ecEditor.addEventListener("org.ekstep.collectioneditor:node:added", $scope.onNodeEvent, $scope);
    ecEditor.addEventListener("org.ekstep.collectioneditor:node:modified", $scope.onNodeEvent, $scope);
    ecEditor.addEventListener("org.ekstep.collectioneditor:node:removed", $scope.onNodeEvent, $scope);
    ecEditor.addEventListener("org.ekstep.collectioneditor:node:reorder", $scope.onNodeEvent, $scope);
    ecEditor.addEventListener("org.ekstep.collectioneditor:content:notfound", $scope.showNoContent, $scope);
    ecEditor.addEventListener("org.ekstep.collectioneditor:content:load", $scope.getContentMetadata, $scope);
    ecEditor.addEventListener("content:title:update", $scope.updateTitle, $scope);
}]);
//# sourceURL=sunbirdheaderapp.js