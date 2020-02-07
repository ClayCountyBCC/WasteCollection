using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WasteCollection.Models;

namespace WasteCollection.Controllers
{
  [RoutePrefix("API/Zone")]
  public class ZoneController : ApiController
  {
    [HttpGet]
    [Route("Search")]
    public List<FoundAddress> Search(int house, string street)
    {
      return FoundAddress.Find(house, street);
    }
  }
}
