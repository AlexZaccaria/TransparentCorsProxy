exports.modify = modify;

function modify(body, proxy, host, filename) {
    body = findAndReplace(body, 'href=', '"', '"', proxy, host, filename);
    body = findAndReplace(body, 'href=', "'", "'", proxy, host, filename);
    body = findAndReplace(body, 'src=', '"', '"', proxy, host, filename);
    body = findAndReplace(body, 'src=', "'", "'", proxy, host, filename);
    body = findAndReplace(body, 'action=', '"', '"', proxy, host, filename);
    body = findAndReplace(body, 'action=', "'", "'", proxy, host, filename);
    body = findAndReplace(body, 'url\\', "(", ")", proxy, host, filename);

    return body;
}

function findAndReplace(body, toReplace, startdelimiter, delimiter, proxy, host, filename) {
    var regex = new RegExp(toReplace + startdelimiter, "g");
    var result;

    while ((result = regex.exec(body))) {
        var start = result.index + (toReplace.replace(/\\/g, '')).length + (startdelimiter.replace(/\\/g, '')).length;
        var end = body.indexOf(delimiter, start);
        var resource = body.substr(start, end - start);

        //href, src vuoti, portano a crash
        if (resource.length === 0) {
            console.log(body.substr(start - 30, end - start + 60));
            continue;
        }

        //skippa se già proxato, se è un comando javascript:void() o se è un link a jquery -???-
        if ((resource.search("javascript") === -1) && (resource.search("jquery.min.js") === -1) && (resource.search(proxy) === -1)) {
            var proxedResource;
            //var originalResource = resource + "";
            resource = resource.replace(/"/ig, '').replace(/'/ig, '');

            if (resource.search("http") === 0) {
                //caso dei link diretti

                // tutti gli http:// vengono portati ad un comune http:/
                resource = resource.replace(/https:\/\//ig, 'https:/');
                resource = resource.replace(/http:\/\//ig, 'http:/');
                // tutti gli http:/ vengono normalizzati in http://
                resource = resource.replace(/https:\//ig, 'https://');
                resource = resource.replace(/http:\//ig, 'http://');

                proxedResource = proxy + "/" + resource;
                //console.log(host, originalResource, proxedResource);
            } else if (resource.search("/") === 0) {
                //caso dei link a path radice

                // tutti gli http:// dell'host vengono portati ad un placeholder DFGHJKL
                var tmpHost = host + "";
                tmpHost = tmpHost.replace(/https:\/\//ig, 'ERTYUIO');
                tmpHost = tmpHost.replace(/http:\/\//ig, 'DFGHJKL');
                // recuperiamo la radice dell'host
                tmpHost = tmpHost.split("/")[0];
                // tutti gli http:/ vengono normalizzati in http://
                tmpHost = tmpHost.replace(/ERTYUIO/ig, 'https://');
                tmpHost = tmpHost.replace(/DFGHJKL/ig, 'http://');

                proxedResource = proxy + "/" + tmpHost + resource;
                //console.log(host, originalResource, proxedResource);
            } else if (resource.search("\\.\\.") === 0) {
                //caso dei link a path superiore

                // http://www.it/ > 4
                // http://www.it/a/ > 5
                var tmpHost = host + "";
                if (tmpHost.split("/").length > 4) {
                    tmpHost = tmpHost.replace(/https:\/\//ig, 'ERTYUIO');
                    tmpHost = tmpHost.replace(/http:\/\//ig, 'DFGHJKL');
                    // recuperiamo la radice dell'host
                    tmpHost = tmpHost.split("/")[0];
                    // tutti gli http:/ vengono normalizzati in http://
                    tmpHost = tmpHost.replace(/ERTYUIO/ig, 'https://');
                    tmpHost = tmpHost.replace(/DFGHJKL/ig, 'http://');

                    resource = "/" + resource.replace(/\.\.\//ig, '');
                } else {
                    resource = resource.replace(/\.\.\//ig, '');
                }

                proxedResource = proxy + "/" + tmpHost + resource;
                //console.log(tmpHost, originalResource, proxedResource);
            } else {
                //caso dei link a path relativi

                proxedResource = proxy + "/" + host + resource;
                //console.log(filename, host, originalResource, proxedResource);
            }

            body = body.substr(0, start) + proxedResource + body.substr(end);
        }
    }

    return body;
}