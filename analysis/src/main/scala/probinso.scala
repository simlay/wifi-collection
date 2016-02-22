import java.io.File
import scala.math.{abs, log10, pow, sqrt, toRadians, sin, cos, atan2}
import com.cra.figaro.language.{Apply, Element, Constant, Universe}
import com.cra.figaro.library.atomic.continuous.{Normal, Uniform}
import com.github.tototoshi.csv.CSVReader
import com.cra.figaro.algorithm.sampling.{ProposalScheme, MetropolisHastings}

object probinso {
  class transmitterModel(frequency: Double) {

    def distance_function(
        lat_a : Double, lon_a : Double,
        lat_b : Double, lon_b : Double) = {

      val R  : Double = 6371000.0
      val ϕ1 : Double = toRadians(lat_a)
      val ϕ2 : Double = toRadians(lat_b)
      val Δϕ : Double = toRadians(lat_b - lat_a)
      val Δλ : Double = toRadians(lon_b - lon_a)

      // haversine
      val a : Double = pow(sin(Δϕ/2),2) + cos(ϕ1)*cos(ϕ2)*pow(sin(Δλ/2),2)

      val c : Double = 2 * atan2(sqrt(a), sqrt(1-a))
      val d : Double = R * c
      d
    }

    implicit val myUniverse: Universe = new Universe()

    // need to learn how to make VonMisses distributions
    val xLat : Element[Double] = Uniform(0.0, 90.0)
    val xLon : Element[Double] = Uniform(-180.0, 0.0)

    def conf(radius : Double) = {
      val k : Double = 4.0 // two standard deviations
      radius/k
    }

    def assertEvidence(lat : Double, lon : Double, rad : Double, p : Double) {

      val sLat : Element[Double] = Constant(lat)
      val sLon : Element[Double] = Constant(lon)

      val _distance : Element[Double] = Apply(xLat, xLon, sLat, sLon,
        (xLat: Double, xLon: Double, sLat : Double, sLon : Double) =>
        distance_function(xLat, xLon, sLat, sLon)
        )

      val distance : Element[Double] = Normal(_distance, conf(rad))

      val _power : Element[Double] = Apply(distance,
        ((distance : Double) => + 20 * log10(frequency) + 92)
        ) // perfect power without attenuation

      // p \in (-100, -10)
      val attenuation : Element[Double] = Uniform(0.2, 0.8)
      // TODO : attenuation may need a more realistic distribution

      val power  : Element[Double] = Apply(_power, attenuation,
        (_power : Double, attenuation : Double) =>
        attenuation * _power
        )

      power.addConstraint((d : Double) => pow(0.002, abs(d-p)))
    }

    def inferFromEvidence = {
      val steps : Int = 2000000000
      val algorithm = MetropolisHastings(steps, ProposalScheme.default, xLat, xLon)(this.myUniverse)
      algorithm.start

      //val retLat : Double = algorithm.expectation(this.xLat, identity)
      //val retLon : Double = algorithm.expectation(this.xLon, identity)
      val retLat : Double = algorithm.expectation(this.xLat, (i: Double => i))
      val retLon : Double = algorithm.expectation(this.xLon, (i: Double => i))
      algorithm.stop
      algorithm.kill
      List(retLat, retLon)
    }
  }

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))
    var transmitters : Map[String, transmitterModel] = Map()
    for (line <- reader.all()) {
      if (!(transmitters.contains(line(6))))
        transmitters += (line(6) -> new transmitterModel(line(7).toDouble))

      transmitters(line(6)).assertEvidence(
        line(2).toDouble,
        line(3).toDouble,
        line(4).toDouble,
        line(8).toDouble
      )
    }

    for ((key, value) <- transmitters)
      println(key :: value.inferFromEvidence)

    println()
    println("Yo Dog!")
  }
}
