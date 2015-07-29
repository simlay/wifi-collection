import java.io.File
import com.github.tototoshi.csv.CSVReader
import math.{ sqrt, pow , log10}

import com.cra.figaro.library.compound.{If}
import com.cra.figaro.library.atomic.continuous.Normal
import com.cra.figaro.library.atomic.continuous.Uniform
import com.cra.figaro.library.atomic.continuous.MultivariateNormal
import com.cra.figaro.language.{Element, Constant, Apply}
import com.cra.figaro.algorithm.factored.VariableElimination



object simlay {
  val sLat : Element[Double] = Uniform(-180, 180)
  val sLon : Element[Double] = Uniform(-90, 90)

  val xLat : Element[Double] = Uniform(-90, 90)
  val xLon : Element[Double] = Uniform(-90, 90)
  val frequency: Int = 2412

  def distance (x1:Double, y1:Double, x2:Double, y2:Double) = {
    sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2))
  }

  def power = Apply(
    sLat, sLon, xLat, xLon,
    (xs: Double, ys: Double, xa: Double, ya: Double) =>
      20*log10(distance(xs, ys, xa, ya)) + 20*log10(frequency) + 100
  )

  val sPower : Element[Double] = Normal(power, 10)


  def main(args: Array[String]) = {
    println("BEGIN!")

    val reader = CSVReader.open(new File("tables.csv"))
    val lines = reader.all()
    var lat = 0.0
    var lon = 0.0
    var power = 0.0
    println("Initial values")
    println(xLat.value)
    println(xLon.value)
    for(line <- lines) {
      lat = line(2).toDouble
      lat = line(3).toDouble
      power = line(8).toDouble
      sLat.observe(lat)
      sLat.observe(lon)
      sPower.observe(power)
    }
    println("Generative distribution values")
    println(xLat.value)
    println(xLon.value)

    println("Sample distribution values")
    println(sLat.value)
    println(sLon.value)
  }
}
