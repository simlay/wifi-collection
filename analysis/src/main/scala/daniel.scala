

import com.cra.figaro.language._
import com.cra.figaro.library.compound._
import com.cra.figaro.library.compound.DuoElement
import com.cra.figaro.algorithm.factored.beliefpropagation._
import com.cra.figaro.library.atomic.continuous._
import com.github.tototoshi.csv.CSVReader
import java.io.File
import com.cra.figaro.library.atomic.continuous.AtomicNormal
import com.cra.figaro.library.atomic.continuous.AtomicNormal


class Position() {
  val positionMean : Element[List[Double]] = Constant(List(1.0, 1.0))
  val positionVariance = 3.0;
  val positionCovarianceMatrix = Constant(List(List(positionVariance, 0.0), List(0.0, positionVariance)))
  val positionDistribution = MultivariateNormal(positionMean, positionCovarianceMatrix)
}


class Transmitter() {
  val position = new Position() 
}

class TransmitterData() {
  val level = -81.0
  val frequency = 2400
}

class Receiver(transmittersVisData: List[TransmitterData]) {
  val position = new Position()
  val transmittersVisibleData = transmittersVisData
  val distanceDistributions : List[Element[Normal]] = List()
  
  for ( i <- 1 to transmittersVisible.length ) {
    val distance = transmittersVisibleData(i).level // TODO SOME FUNCTION OF POWER LEVEL AND FREQUENCY
    val variance = 2.0 // TODO SOME FUNCTION OF WIFI ROUTERS INTERFERING ONE ANOTHER
    distanceDistributions ::: List( Normal(Constant(distance), Constant(variance)) )
  }
  
}



object Hi {
  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))
    val data = reader.all()
    
    val t = new Transmitter()
    val n = new Receiver(List())
    
    
    /*val variance = 3.0
    val mean = List(1.0, 1.0)
    val position = MultivariateNormal(mean, List(List(variance, 0.0), List(0.0, variance)))
    */
    
    
    
    
    
    
    println(data(1))
    
    
    println("Hi!")
  }
}



