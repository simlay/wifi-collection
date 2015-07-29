import java.io.File
import scala.math.{abs, log10, pow, sqrt, toRadians, sin, cos, atan2}
import com.cra.figaro.language.{Apply, Element, Constant}
import com.cra.figaro.library.atomic.continuous.{Normal, Uniform}
import com.github.tototoshi.csv.CSVReader
import com.cra.figaro.algorithm.sampling.{ProposalScheme, MetropolisHastings}



object probinso {
  class transmitterModel(frequency: Double) {
    
    def distance_function(
        lat_a : Double, lon_a : Double,
        lat_b : Double, lon_b : Double) = {
      val R = 6371.0
      val dLat = toRadians(lat_b - lat_a)
      val dLon = toRadians(lon_b - lon_a)
  
      val a = sin(dLat/2.0) * sin(dLat/2.0) +
              cos(toRadians(lat_a)) * cos(toRadians(lat_b)) *
              sin(dLon/2.0) * sin(dLon/2.0)
  
      val c = 2 * atan2(sqrt(a), sqrt(1-a))
      val d = R * c
      d
    }
  
    val xLat : Element[Double] = Uniform(-90.0, 90.0)
    val xLon : Element[Double] = Uniform(-180.0, 180.0)
  
    def assertEvidence(lat : Double, lon : Double, p : Double) {
  
      val sLat : Element[Double] = Constant(lat)
      val sLon : Element[Double] = Constant(lon)
  
      val _dist  : Element[Double] = Apply(xLat, xLon, sLat, sLon,
        (xLat: Double, xLon: Double, sLat : Double, sLon : Double) =>
        distance_function(xLat, xLon, sLat, sLon)
        )
  
      val _power : Element[Double] = Apply(_dist,
        ((dist : Double) => + 20 * log10(frequency) + 100)
        )
  
      val power  : Element[Double] = Normal(_power, 5)
  
      power.addConstraint((d : Double) => pow(0.02, abs(p - d)))
    }
  
    def infer = {
       val algorithm = MetropolisHastings(20000, ProposalScheme.default, xLat, xLon)
       algorithm.start()
       val retLat = algorithm.expectation(xLat, (i: Double) => i)
       val retLon = algorithm.expectation(xLon, (i: Double) => i)
       algorithm.stop()
       List(retLat, retLon)
    }
  }

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))
    var transmitters : Map[String, transmitterModel] = Map()
    for (line <- reader.all()) {
      println(line)
      if (!(transmitters.contains(line(6))))
        transmitters += (line(6) -> new transmitterModel(line(7).toDouble))

      transmitters(line(6)).assertEvidence(line(2).toDouble, line(3).toDouble,  line(8).toDouble)
    }

    for ((key, value) <- transmitters)
      println(key :: value.infer)

    println()
    println("Yo Dog!")
  }
}
